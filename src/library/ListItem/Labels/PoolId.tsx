// Copyright 2024 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { useTooltip } from 'contexts/Tooltip';
import { TooltipTrigger } from 'library/ListItem/Wrappers';

export const PoolId = ({ id }: { id: number }) => {
  const { t } = useTranslation('library');
  const { setTooltipTextAndOpen } = useTooltip();

  const tooltipText = t('poolId');

  return (
    <div className="label pool">
      <TooltipTrigger
        className="tooltip-trigger-element"
        data-tooltip-text={tooltipText}
        onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
      />
      <FontAwesomeIcon icon={faHashtag} />
      &nbsp;{id}
    </div>
  );
};
