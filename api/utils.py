from datetime import date

from . import global_param

def calcDecayedMastery(instance):
    oldMastery = instance.mastery
    timeInterval = (date.today() - instance.last_reviewed).days
    # y = f - 1/r * x^2 * 1/(n + f) where r = 30 ^ 2, n = 1
    return max(0, oldMastery - 1 / (global_param.MEMORY_DECAY) ** 2 * (timeInterval) ** 2 * 1 / (global_param.MEMORY_DECAY_WEIGHT + oldMastery))