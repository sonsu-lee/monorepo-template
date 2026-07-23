import type { Actor, AnyActorLogic, SnapshotFrom } from 'xstate';

interface MachineFlow<TLogic extends AnyActorLogic, TView, TCommands> {
  readonly logic: TLogic;
  readonly select: (snapshot: SnapshotFrom<TLogic>) => TView;
  readonly compare?: (previous: TView, next: TView) => boolean;
  readonly createCommands: (actorRef: Actor<TLogic>) => TCommands;
}

const defineMachineFlow = <TLogic extends AnyActorLogic, TView, TCommands>(
  flow: MachineFlow<TLogic, TView, TCommands>,
): MachineFlow<TLogic, TView, TCommands> => flow;

export { defineMachineFlow, type MachineFlow };
