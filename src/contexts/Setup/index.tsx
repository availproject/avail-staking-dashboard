// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import React, { useEffect, useState } from 'react';
import { MaybeAccount } from 'types';
import { greaterThanZero, localStorageOrDefault, unitToPlanck } from 'Utils';
import { useApi } from '../Api';
import { useConnect } from '../Connect';
import { useStaking } from '../Staking';
import {
  defaultNominatorProgress,
  defaultPoolProgress,
  defaultSetupContext,
} from './defaults';
import {
  NominatorProgress,
  NominatorSetup,
  NominatorSetups,
  PoolProgress,
  PoolSetup,
  PoolSetups,
  SetupContextInterface,
  SetupType,
} from './types';

export const SetupContext =
  React.createContext<SetupContextInterface>(defaultSetupContext);

export const useSetup = () => React.useContext(SetupContext);

export const SetupProvider = ({ children }: { children: React.ReactNode }) => {
  const { network } = useApi();
  const { inSetup } = useStaking();
  const { accounts, activeAccount } = useConnect();
  const { membership: poolMembership } = usePoolMemberships();

  // is the user actively on the setup page
  const [onNominatorSetup, setOnNominatorSetup] = useState<boolean>(false);

  // is the user actively on the pool creation page
  const [onPoolSetup, setOnPoolSetup] = useState<boolean>(false);

  // Store all imported accounts nominator setups.
  const [nominatorSetups, setNominatorSetups] = useState<NominatorSetups>({});

  // Store all imported accounts pool creation setups.
  const [poolSetups, setPoolSetups] = useState<PoolSetups>({});

  // Generates the default setup objects or the currently connected accounts. Refers to local
  // storage to hydrate state, falls back to defaults otherwise.
  const refreshSetups = () => {
    setNominatorSetups(localNominatorSetups());
    setPoolSetups(localPoolSetups());
  };

  // Gets the setup progress for a connected account. Falls back to default setup if progress does
  // not yet exist.
  const getSetupProgress = (
    type: SetupType,
    address: MaybeAccount
  ): NominatorSetup | PoolSetup => {
    const setup = Object.fromEntries(
      Object.entries(type === 'stake' ? nominatorSetups : poolSetups).filter(
        ([k]) => k === address
      )
    );

    return (
      setup[address || ''] || {
        progress: defaultProgress(type),
        section: 1,
      }
    );
  };

  // Sets setup progress for an address. Updates localStorage followed by app state.
  const setActiveAccountSetup = (
    type: SetupType,
    progress: NominatorProgress | PoolProgress
  ) => {
    if (!activeAccount) return;

    const updatedSetups = updateSetups(
      assignSetups(type),
      progress,
      activeAccount
    );
    // Update setups with updated progress.
    localStorage.setItem(
      type === 'stake' ? 'nominator_setups' : 'pool_setups',
      JSON.stringify(updatedSetups)
    );

    if (type === 'stake') {
      setNominatorSetups(updatedSetups as NominatorSetups);
    } else {
      setPoolSetups(updatedSetups as PoolSetups);
    }
  };

  // Sets active setup section for an address.
  const setActiveAccountSetupSection = (type: SetupType, section: number) => {
    if (!activeAccount) return;

    const setups = assignSetups(type);
    const updatedSetups = updateSetups(
      setups,
      setups[activeAccount]?.progress ?? defaultProgress(type),
      activeAccount,
      section
    );
    localStorage.setItem(
      type === 'stake' ? 'nominator_setups' : 'pool_setups',
      JSON.stringify(updatedSetups)
    );

    if (type === 'stake') {
      setNominatorSetups(updatedSetups as NominatorSetups);
    } else {
      setPoolSetups(updatedSetups as PoolSetups);
    }
  };

  // Utility to update the progress item of either a nominator setup or pool setup,
  const updateSetups = <
    T extends NominatorSetups | PoolSetups,
    U extends NominatorProgress | PoolProgress
  >(
    all: T,
    newSetup: U,
    account: string,
    maybeSection?: number
  ) => {
    const current = Object.assign(all[account] || {});
    const section = maybeSection ?? current.section ?? 1;

    all[account] = {
      ...current,
      progress: newSetup,
      section,
    };

    return all;
  };

  // Gets the stake setup progress as a percentage for an address.
  const getNominatorSetupPercent = (address: MaybeAccount) => {
    if (!address) return 0;
    const setup = getSetupProgress('stake', address) as NominatorSetup;
    const { progress } = setup;
    const bond = unitToPlanck(progress?.bond || '0', network.units);

    const p = 33;
    let percentage = 0;
    if (greaterThanZero(bond)) percentage += p;
    if (progress.nominations.length) percentage += p;
    if (progress.payee.destination !== null) percentage += p;
    return percentage;
  };

  // Gets the stake setup progress as a percentage for an address.
  const getPoolSetupPercent = (address: MaybeAccount) => {
    if (!address) return 0;
    const setup = getSetupProgress('pool', address) as PoolSetup;
    const { progress } = setup;
    const bond = unitToPlanck(progress?.bond || '0', network.units);

    const p = 25;
    let percentage = 0;
    if (progress.metadata !== '') percentage += p;
    if (greaterThanZero(bond)) percentage += p;
    if (progress.nominations.length) percentage += p;
    if (progress.roles !== null) percentage += p - 1;
    return percentage;
  };

  // Utility to copy the current setup state based on setup type
  const assignSetups = (type: SetupType) =>
    type === 'stake' ? { ...nominatorSetups } : { ...poolSetups };

  // Utility to get the default progress based on type.
  const defaultProgress = (type: SetupType) =>
    type === 'stake' ? defaultNominatorProgress : defaultPoolProgress;

  // Utility to get nominator setups, type casted as NominatorSetups.
  const localNominatorSetups = () =>
    localStorageOrDefault('nominator_setups', {}, true) as NominatorSetups;

  // Utility to get pool setups, type casted as PoolSetups.
  const localPoolSetups = () =>
    localStorageOrDefault('pool_setups', {}, true) as PoolSetups;

  // Move away from setup pages on completion / network change.
  useEffect(() => {
    if (!inSetup()) {
      setOnNominatorSetup(false);
    }
    if (poolMembership) {
      setOnPoolSetup(false);
    }
  }, [inSetup(), network, poolMembership]);

  // update setup state when activeAccount changes
  useEffect(() => {
    if (accounts.length) refreshSetups();
  }, [activeAccount, network, accounts]);

  return (
    <SetupContext.Provider
      value={{
        getSetupProgress,
        getNominatorSetupPercent,
        getPoolSetupPercent,
        setActiveAccountSetup,
        setActiveAccountSetupSection,
        setOnNominatorSetup,
        setOnPoolSetup,
        onNominatorSetup,
        onPoolSetup,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
};
