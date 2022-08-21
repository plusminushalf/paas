import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { Deployed } from "../generated/SingletonFactory/SingletonFactory"

export function createDeployedEvent(createdContract: Address): Deployed {
  let deployedEvent = changetype<Deployed>(newMockEvent())

  deployedEvent.parameters = new Array()

  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "createdContract",
      ethereum.Value.fromAddress(createdContract)
    )
  )

  return deployedEvent
}
