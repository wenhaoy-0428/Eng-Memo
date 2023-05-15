def isYesterday(today, day):
    return (today - day).days == 1


def GetLongestConsecutiveDays(dates):
    """ Calculates the Longest consecutive days in the given array of dates
    Args:
        dates ([DateTime]): An array of dates in reverse chronological order
    return: int
    """
    maxDays = 0
    maxSubDays = 0
    for i, currDay in enumerate(dates):
        nextIdx = i + 1
        if nextIdx >= len(dates):
            break
        if isYesterday(currDay, dates[nextIdx]):
            maxSubDays += 1
        else:
            maxDays = max(maxDays, maxSubDays)
            maxSubDays = 0
    maxDays = max(maxDays, maxSubDays)
    return maxDays


def GetRecentConsecutiveDays(dates):
    result = 0
    for i, currDay in enumerate(dates):
        nextIdx = i + 1
        if nextIdx >= len(dates):
            break
        if isYesterday(currDay, dates[nextIdx]):
            result += 1
        else:
            return result
    return result
