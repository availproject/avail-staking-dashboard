// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Close } from 'library/Modal/Close';
import { SelectItems } from 'library/SelectItems';
import type { AnyFunction } from 'types';
import { Extension } from './Extension';
import { Ledger } from './Ledger';
import { Proxies } from './Proxies';
import { ReadOnly } from './ReadOnly';
// import { Vault } from './Vault';
import { ExtensionsWrapper } from './Wrappers';
import { ButtonPrimaryInvert } from 'kits/Buttons/ButtonPrimaryInvert';
import { ButtonTab } from 'kits/Buttons/ButtonTab';
import { mobileCheck } from './Utils';
import { useOverlay } from 'kits/Overlay/Provider';
import { ActionItem } from 'library/ActionItem';
import { ModalFixedTitle } from 'kits/Overlay/structure/ModalFixedTitle';
import { ModalCustomHeader } from 'kits/Overlay/structure/ModalCustomHeader';
import { ModalSection } from 'kits/Overlay/structure/ModalSection';
import { ModalMotionThreeSection } from 'kits/Overlay/structure/ModalMotionThreeSection';
import { ModalPadding } from 'kits/Overlay/structure/ModalPadding';
import { useExtensions } from '@w3ux/react-connect-kit';
import { useEffectIgnoreInitial } from '@w3ux/hooks';
import extensions from '@w3ux/extension-assets';
import type { ExtensionArrayListItem } from '@w3ux/extension-assets/util';

export const Connect = () => {
  const { t } = useTranslation('modals');
  const { extensionsStatus } = useExtensions();
  const { replaceModal, setModalHeight, modalMaxHeight } = useOverlay().modal;

  // Whether the app is running on mobile.
  const isMobile = mobileCheck();

  // Whether the app is running in Nova Wallet.
  const inNova = !!window?.walletExtension?.isNovaWallet || false;

  // Whether the app is running in a SubWallet Mobile.
  const inSubWallet = !!window.injectedWeb3?.['subwallet-js'] && isMobile;

  // Whether the app is running on of mobile wallets.
  const inMobileWallet = inNova || inSubWallet;

  // Get supported extensions.
  const extensionsAsArray = Object.entries(extensions).map(([key, value]) => ({
    id: key,
    ...value,
  })) as ExtensionArrayListItem[];

  const disabledExtensionIds = [
    'metamask-polkadot-snap',
    'enkrypt',
    'fearless-wallet',
    'polkagate',
    'polkagate-snap',
    'polkadotvault',
    'walletconnect',
  ];

  // If in SubWallet Mobile, keep `subwallet-js` only.
  const web = inSubWallet
    ? extensionsAsArray.filter((a) => a.id === 'subwallet-js')
    : // If in Nova Wallet, fetch nova wallet metadata and replace its id with `polkadot-js`.
      inNova
      ? extensionsAsArray
          .filter((a) => a.id === 'nova-wallet')
          .map((a) => ({ ...a, id: 'polkadot-js' }))
      : // Otherwise, keep all extensions except `polkadot-js`.
        extensionsAsArray.filter(
          (a) =>
            a.id !== 'polkadot-js' &&
            a.category === 'web-extension' &&
            !disabledExtensionIds.includes(a.id)
        );

  const installed = web.filter((a) =>
    Object.keys(extensionsStatus).find((key) => key === a.id)
  );
  const other = web.filter((a) => !installed.find((b) => b.id === a.id));

  // toggle read only management
  const [readOnlyOpen, setReadOnlyOpen] = useState<boolean>(false);

  // toggle proxy delegate management
  const [newProxyOpen, setNewProxyOpen] = useState<boolean>(false);

  // active modal section
  const [section, setSection] = useState<number>(0);

  // refs for wrappers
  const headerRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const readOnlyRef = useRef<HTMLDivElement>(null);
  const proxiesRef = useRef<HTMLDivElement>(null);

  const refreshModalHeight = () => {
    // Preserve height by taking largest height from modals.
    let height = headerRef.current?.clientHeight || 0;
    height += Math.max(
      homeRef.current?.clientHeight || 0,
      readOnlyRef.current?.clientHeight || 0,
      proxiesRef.current?.clientHeight || 0
    );
    setModalHeight(height);
  };

  // Resize modal on state change.
  useEffectIgnoreInitial(() => {
    refreshModalHeight();
  }, [section, readOnlyOpen, newProxyOpen, extensionsStatus]);

  useEffect(() => {
    window.addEventListener('resize', refreshModalHeight);
    return () => {
      window.removeEventListener('resize', refreshModalHeight);
    };
  }, []);

  // Hardware connect options JSX.
  const ConnectHardwareJSX = (
    <>
      <ActionItem text={t('hardware')} />
      <ExtensionsWrapper>
        <SelectItems layout="two-col">
          {[Ledger].map((Item: AnyFunction, i: number) => (
            <Item key={`hardware_item_${i}`} />
          ))}
        </SelectItems>
      </ExtensionsWrapper>
    </>
  );

  // Web extension connect options JSX.
  const ConnectExtensionsJSX = (
    <>
      <ActionItem text={t('web')} />
      <ExtensionsWrapper>
        <SelectItems layout="two-col">
          {installed.concat(other).map((extension, i) => (
            <Extension key={`extension_item_${i}`} meta={extension} />
          ))}
        </SelectItems>
      </ExtensionsWrapper>
    </>
  );
  // Display hardware before extensions. If in Nova Wallet or SubWallet Mobile, display extension
  // before hardware.
  const ConnectCombinedJSX = !inMobileWallet ? (
    <>
      {ConnectHardwareJSX}
      {ConnectExtensionsJSX}
    </>
  ) : (
    <>
      {ConnectExtensionsJSX}
      {ConnectHardwareJSX}
    </>
  );

  return (
    <ModalSection type="carousel">
      <Close />
      <ModalFixedTitle ref={headerRef} withStyle>
        <ModalCustomHeader>
          <div className="first">
            <h1>{t('connect')}</h1>
            <ButtonPrimaryInvert
              text={t('goToAccounts')}
              iconRight={faChevronRight}
              iconTransform="shrink-3"
              onClick={() => replaceModal({ key: 'Accounts' })}
              marginLeft
            />
          </div>
          <ModalSection type="tab">
            <ButtonTab
              title={t('extensions')}
              onClick={() => setSection(0)}
              active={section === 0}
            />
            <ButtonTab
              title={t('readOnly')}
              onClick={() => setSection(1)}
              active={section === 1}
            />
            <ButtonTab
              title={t('proxies')}
              onClick={() => setSection(2)}
              active={section === 2}
            />
          </ModalSection>
        </ModalCustomHeader>
      </ModalFixedTitle>

      <ModalMotionThreeSection
        style={{
          maxHeight: modalMaxHeight - (headerRef.current?.clientHeight || 0),
        }}
        animate={
          section === 0 ? 'home' : section === 1 ? 'readOnly' : 'proxies'
        }
        transition={{
          duration: 0.5,
          type: 'spring',
          bounce: 0.1,
        }}
        variants={
          {
            home: {
              left: 0,
            },
            readOnly: {
              left: '-100%',
            },
            proxies: {
              left: '-200%',
            },
          } as any
        }
      >
        <div className="section">
          <ModalPadding horizontalOnly ref={homeRef}>
            {ConnectCombinedJSX}
            {!inMobileWallet && (
              <>
                <ActionItem text={t('developerTools')} />
                <ExtensionsWrapper>
                  <SelectItems layout="two-col">
                    {extensionsAsArray
                      .filter((a) => a.id === 'polkadot-js')
                      .map((extension, i) => (
                        <Extension
                          key={`extension_item_${i}`}
                          meta={extension}
                        />
                      ))}
                  </SelectItems>
                </ExtensionsWrapper>
              </>
            )}
          </ModalPadding>
        </div>
        <div className="section">
          <ModalPadding horizontalOnly ref={readOnlyRef}>
            <ReadOnly setInputOpen={setReadOnlyOpen} inputOpen={readOnlyOpen} />
          </ModalPadding>
        </div>
        <div className="section">
          <ModalPadding horizontalOnly ref={proxiesRef}>
            <Proxies setInputOpen={setNewProxyOpen} inputOpen={newProxyOpen} />
          </ModalPadding>
        </div>
      </ModalMotionThreeSection>
    </ModalSection>
  );
};
