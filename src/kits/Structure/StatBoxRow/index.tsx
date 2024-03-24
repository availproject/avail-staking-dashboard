// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types';
import { Wrapper } from './Wrapper';

/**
 * @name StatBoxRow
 * @summary Used to house a row of `StatBox` items.
 */
export const StatBoxRow = ({ children, style }: ComponentBase) => (
  <Wrapper className="page-padding" style={style}>
    {children}
  </Wrapper>
);
