from datetime import date

from . import global_param

def calcDecayedFamiliarity(instance):
    oldFamiliarity = instance.familiarity
    timeInterval = (date.today() - instance.last_reviewed).days
    # y = f - 1/r * x^2 * 1/(n + f) where r = 30 ^ 2, n = 1
    return max(0, oldFamiliarity - 1 / (global_param.MEMORY_DECAY) ** 2 * (timeInterval) ** 2 * 1 / (global_param.MEMORY_DECAY_WEIGHT + oldFamiliarity))