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

export type SyncStatusType = 'Synced' | 'OutOfSync' | 'Unknown';
export type HealthStatusType =
  | 'Healthy'
  | 'Degraded'
  | 'Progressing'
  | 'Suspended'
  | 'Missing'
  | 'Unknown';

export interface ArgoSyncStatus {
  status: SyncStatusType;
  revision: string;
}

export interface ArgoHealthStatus {
  status: HealthStatusType;
  message?: string;
}

export interface ArgoSource {
  repoURL: string;
  path?: string;
  targetRevision?: string;
  chart?: string;
}

export interface ArgoDestination {
  server?: string;
  namespace: string;
  name?: string;
}

export interface ArgoResourceStatus {
  group?: string;
  version: string;
  kind: string;
  namespace?: string;
  name: string;
  status?: string;
  health?: ArgoHealthStatus;
  requiresPruning?: boolean;
}

export interface ArgoCondition {
  type: string;
  message: string;
  lastTransitionTime?: string;
}

export interface ArgoOperationState {
  phase?: string;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface KubeArgoApplication {
  spec: {
    source: ArgoSource;
    destination: ArgoDestination;
    project: string;
    syncPolicy?: {
      automated?: { prune?: boolean; selfHeal?: boolean };
      syncOptions?: string[];
    };
  };
  status: {
    sync: ArgoSyncStatus;
    health: ArgoHealthStatus;
    operationState?: ArgoOperationState;
    resources?: ArgoResourceStatus[];
    conditions?: ArgoCondition[];
    summary?: { images?: string[] };
    reconciledAt?: string;
  };
}

export interface ArgoProjectDestination {
  server?: string;
  namespace: string;
  name?: string;
}

export interface ArgoProjectRole {
  name: string;
  description?: string;
  policies?: string[];
  jwtTokens?: { iat: number; exp?: number; id?: string }[];
}

export interface KubeArgoAppProject {
  spec: {
    description?: string;
    sourceRepos: string[];
    destinations: ArgoProjectDestination[];
    roles?: ArgoProjectRole[];
    clusterResourceWhitelist?: { group: string; kind: string }[];
    namespaceResourceBlacklist?: { group: string; kind: string }[];
    orphanedResources?: { warn?: boolean };
  };
}
