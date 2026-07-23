'use client';

import { useActorRef, useSelector } from '@xstate/react';
import { useMemo } from 'react';
import type { ActorOptions, AnyActorLogic, IsNotNever, RequiredActorOptionsKeys } from 'xstate';

import type { MachineFlow } from './define-machine-flow';

type MachineFlowActorOptions<TLogic extends AnyActorLogic> = Omit<
  ActorOptions<TLogic>,
  RequiredActorOptionsKeys<TLogic>
> & {
  [K in RequiredActorOptionsKeys<TLogic>]-?: Exclude<ActorOptions<TLogic>[K], undefined>;
};

type MachineFlowOptionsArgument<TLogic extends AnyActorLogic> =
  IsNotNever<RequiredActorOptionsKeys<TLogic>> extends true
    ? [options: MachineFlowActorOptions<TLogic>]
    : [options?: MachineFlowActorOptions<TLogic>];

interface MachineFlowResult<TView, TCommands> {
  readonly view: TView;
  readonly commands: TCommands;
}

const useMachineFlow = <TLogic extends AnyActorLogic, TView, TCommands>(
  flow: MachineFlow<TLogic, TView, TCommands>,
  ...[options]: MachineFlowOptionsArgument<TLogic>
): MachineFlowResult<TView, TCommands> => {
  const actorRef = useActorRef(flow.logic, options);
  const view = useSelector(actorRef, flow.select, flow.compare);
  const commands = useMemo(() => flow.createCommands(actorRef), [actorRef, flow]);

  return { commands, view };
};

export { useMachineFlow, type MachineFlowActorOptions, type MachineFlowResult };
