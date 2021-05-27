import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class SunscribedQueue {
  readonly id: string;
  readonly username: string;
  readonly score: number;
  readonly hasSubscribed: boolean;
  readonly topic: string;
  constructor(init: ModelInit<SunscribedQueue>);
  static copyOf(source: SunscribedQueue, mutator: (draft: MutableModel<SunscribedQueue>) => MutableModel<SunscribedQueue> | void): SunscribedQueue;
}