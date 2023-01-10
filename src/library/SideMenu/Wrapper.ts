// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  SideMenuMaximisedWidth,
  SideMenuMinimisedWidth,
  SideMenuStickyThreshold,
} from 'consts';
import styled from 'styled-components';
import {
  backgroundOverlay,
  borderPrimary,
  networkColor,
  textSecondary,
} from 'theme';
import { MinimisedProps } from './types';

export const Wrapper = styled.div<MinimisedProps>`
  border-radius: ${(props) => (props.minimised ? '0.7rem' : 0)};
  background: none;
  padding: 1rem 1rem 1rem 1.25rem;
  overflow: auto;
  flex-grow: 1;
  margin: 0.75rem 0 3.35rem 0rem;
  display: flex;
  flex-flow: column nowrap;
  backdrop-filter: blur(4px);
  width: ${(props) =>
    props.minimised
      ? `${SideMenuMinimisedWidth}px`
      : `${SideMenuMaximisedWidth}px`};

  @media (max-width: ${SideMenuStickyThreshold}px) {
    background: ${backgroundOverlay};
    transition: all 0.2s;
    border-radius: 0.75rem;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  section {
    &:first-child {
      flex-grow: 1;
    }
    /* Footer */
    &:last-child {
      display: flex;
      flex-flow: ${(props) => (props.minimised ? 'column wrap' : 'row wrap')};
      align-items: center;
      padding-top: 0.5rem;

      button {
        position: relative;
        color: ${textSecondary};
        transition: color 0.2s;
        margin-top: ${(props) => (props.minimised ? '1.25rem' : 0)};
        margin-right: ${(props) => (props.minimised ? 0 : '1rem')};
        opacity: 0.75;
        padding: 0.1rem;

        path {
          fill: ${textSecondary};
        }
        &:hover {
          opacity: 1;
        }
      }
    }
  }
`;

export const LogoWrapper = styled.button<MinimisedProps>`
  display: flex;
  flex-flow: row wrap;
  justify-content: ${(props) => (props.minimised ? 'center' : 'flex-start')};
  width: 100%;
  height: 2.8rem;
  padding: ${(props) => (props.minimised ? '0' : '0.4rem 0.5rem')};
  margin-bottom: ${(props) => (props.minimised ? '1.5rem' : '1rem')};
  position: relative;

  ellipse {
    fill: ${networkColor};
  }
`;

export const Separator = styled.div`
  border-bottom: 1px solid ${borderPrimary};
  width: 100%;
  margin: 1rem 1rem 0.5rem 0;
`;

export const ConnectionSymbol = styled.div<{ color: any }>`
  width: 0.6rem;
  height: 0.6rem;
  background: ${(props) => props.color};
  border-radius: 50%;
  margin: 0 0.7rem;
`;