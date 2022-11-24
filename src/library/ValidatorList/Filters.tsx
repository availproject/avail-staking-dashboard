// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  faArrowDownWideShort,
  faBan,
  faCheck,
  faFilterCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  ButtonInvertRounded,
  ButtonSecondary,
} from '@rossbulat/polkadot-dashboard-ui';
import { useFilters } from 'contexts/Filters';
import { FilterType } from 'contexts/Filters/types';
import { useOverlay } from 'contexts/Overlay';
import { Container } from 'library/Filter/Container';
import { Item } from 'library/Filter/Item';
import { useEffect } from 'react';
import { useValidatorFilters } from '../Hooks/useValidatorFilters';
import { FilterValidators } from './FilterValidators';
import { OrderValidators } from './OrderValidators';

export const Filters = () => {
  const { openOverlayWith } = useOverlay();
  const { resetFilters, getFilters, getOrder, toggleFilter } = useFilters();
  const { filtersToLabels, ordersToLabels } = useValidatorFilters();

  const includes = getFilters(FilterType.Include, 'validators');
  const excludes = getFilters(FilterType.Exclude, 'validators');
  const hasFilters = includes?.length || excludes?.length;
  const order = getOrder('validators');

  // scroll to top of the window on every filter.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [includes, excludes]);

  return (
    <>
      <div style={{ marginBottom: '1.1rem' }}>
        <ButtonInvertRounded
          text="Order"
          marginRight
          iconLeft={faArrowDownWideShort}
          onClick={() => {
            openOverlayWith(<OrderValidators />);
          }}
        />
        <ButtonInvertRounded
          text="Filter"
          marginRight
          iconLeft={faFilterCircleXmark}
          onClick={() => {
            openOverlayWith(<FilterValidators />);
          }}
        />
        <ButtonSecondary
          text="Reset"
          onClick={() => {
            resetFilters(FilterType.Exclude, 'validators');
          }}
          disabled={!hasFilters}
        />
      </div>
      <Container>
        <div className="items">
          <Item
            label={
              order === 'default'
                ? 'Unordered'
                : `Order: ${ordersToLabels[order]}`
            }
            disabled
          />
          {!hasFilters && <Item label="No filters" disabled />}
          {includes?.map((e: string, i: number) => (
            <Item
              key={`validator_include_${i}`}
              label={filtersToLabels[e]}
              icon={faCheck}
              transform="grow-2"
              onClick={() => {
                toggleFilter(FilterType.Include, 'validators', e);
              }}
            />
          ))}
          {excludes?.map((e: string, i: number) => (
            <Item
              key={`validator_exclude_${i}`}
              label={filtersToLabels[e]}
              icon={faBan}
              transform="grow-2"
              onClick={() => {
                toggleFilter(FilterType.Exclude, 'validators', e);
              }}
            />
          ))}
        </div>
      </Container>
    </>
  );
};
