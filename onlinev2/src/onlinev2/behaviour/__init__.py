"""
Behaviour block: user and adversary models that produce actions for the core.

Public API:
  - BehaviourModel, AgentAction, RoundPublicState (protocol)
  - make_behaviour(name, **kwargs)
  - build_population, UserConfig
  - CompositeBehaviourModel
  - get_preset_kwargs, PRESET_NAMES (from behaviour.config)
  - make_behaviour_dashboard (from behaviour.plotting)
"""
from onlinev2.behaviour.protocol import (
    AgentAction,
    BehaviourModel,
    RoundPublicState,
)
from onlinev2.behaviour.factory import make_behaviour
from onlinev2.behaviour.population import build_population, UserConfig
from onlinev2.behaviour.composite import CompositeBehaviourModel
from onlinev2.behaviour.config import get_preset_kwargs, PRESET_NAMES
from onlinev2.behaviour.plotting import make_behaviour_dashboard

__all__ = [
    "AgentAction",
    "BehaviourModel",
    "RoundPublicState",
    "make_behaviour",
    "build_population",
    "UserConfig",
    "CompositeBehaviourModel",
    "get_preset_kwargs",
    "PRESET_NAMES",
    "make_behaviour_dashboard",
]
