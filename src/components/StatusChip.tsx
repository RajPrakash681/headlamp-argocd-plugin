/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Icon } from '@iconify/react';
import { Box, Chip, Tooltip } from '@mui/material';
import React from 'react';
import type { HealthStatusType, SyncStatusType } from '../types';

const SYNC_CONFIG: Record<SyncStatusType, { icon: string; color: string; label: string }> = {
  Synced: { icon: 'mdi:check-circle', color: '#2e7d32', label: 'Synced' },
  OutOfSync: { icon: 'mdi:alert', color: '#e65100', label: 'Out of Sync' },
  Unknown: { icon: 'mdi:help-circle', color: '#757575', label: 'Unknown' },
};

const HEALTH_CONFIG: Record<HealthStatusType, { icon: string; color: string; label: string }> = {
  Healthy: { icon: 'mdi:heart', color: '#2e7d32', label: 'Healthy' },
  Degraded: { icon: 'mdi:heart-broken', color: '#c62828', label: 'Degraded' },
  Progressing: { icon: 'mdi:progress-clock', color: '#1565c0', label: 'Progressing' },
  Suspended: { icon: 'mdi:pause-circle', color: '#757575', label: 'Suspended' },
  Missing: { icon: 'mdi:help-circle-outline', color: '#e65100', label: 'Missing' },
  Unknown: { icon: 'mdi:help-circle', color: '#757575', label: 'Unknown' },
};

interface StatusChipProps {
  status: string;
  config: Record<string, { icon: string; color: string; label: string }>;
  tooltip?: string;
}

function StatusChip({ status, config, tooltip }: StatusChipProps) {
  const cfg = config[status] ?? config['Unknown'];

  const chip = (
    <Chip
      size="small"
      icon={
        <Box display="flex" alignItems="center" ml={0.5}>
          <Icon icon={cfg.icon} style={{ color: cfg.color, fontSize: 16 }} />
        </Box>
      }
      label={cfg.label}
      sx={{
        borderColor: cfg.color,
        color: cfg.color,
        '& .MuiChip-icon': { color: cfg.color },
        fontWeight: 500,
        fontSize: '0.75rem',
      }}
      variant="outlined"
    />
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
  }
  return chip;
}

export function SyncChip({
  status,
  tooltip,
}: {
  status: SyncStatusType | string;
  tooltip?: string;
}) {
  return <StatusChip status={status} config={SYNC_CONFIG} tooltip={tooltip} />;
}

export function HealthChip({
  status,
  tooltip,
}: {
  status: HealthStatusType | string;
  tooltip?: string;
}) {
  return <StatusChip status={status} config={HEALTH_CONFIG} tooltip={tooltip} />;
}
