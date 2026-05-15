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

import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/Crd';
import type { KubeArgoAppProject, KubeArgoApplication } from './types';

export const ArgoCDApplication = makeCustomResourceClass({
  apiInfo: [{ group: 'argoproj.io', version: 'v1alpha1' }],
  kind: 'Application',
  pluralName: 'applications',
  singularName: 'application',
  isNamespaced: true,
});

export const ArgoCDAppProject = makeCustomResourceClass({
  apiInfo: [{ group: 'argoproj.io', version: 'v1alpha1' }],
  kind: 'AppProject',
  pluralName: 'appprojects',
  singularName: 'appproject',
  isNamespaced: true,
});

export type ArgoCDApplicationInstance = InstanceType<typeof ArgoCDApplication>;
export type ArgoCDAppProjectInstance = InstanceType<typeof ArgoCDAppProject>;

export function getAppSpec(app: ArgoCDApplicationInstance): KubeArgoApplication['spec'] {
  return (app.jsonData as unknown as KubeArgoApplication).spec ?? {
    source: { repoURL: '' },
    destination: { namespace: '' },
    project: '',
  };
}

export function getAppStatus(app: ArgoCDApplicationInstance): KubeArgoApplication['status'] {
  return (app.jsonData as unknown as KubeArgoApplication).status ?? {
    sync: { status: 'Unknown', revision: '' },
    health: { status: 'Unknown' },
  };
}

export function getProjectSpec(proj: ArgoCDAppProjectInstance): KubeArgoAppProject['spec'] {
  return (proj.jsonData as unknown as KubeArgoAppProject).spec ?? {
    sourceRepos: [],
    destinations: [],
  };
}
