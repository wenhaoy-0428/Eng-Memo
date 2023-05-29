def isYesterday(today, day):
    return (today - day).days == 1


def GetLongestConsecutiveDays(dates):
    """ Calculates the Longest consecutive days in the given array of dates
    Args:
        dates ([DateTime]): An array of dates in reverse chronological order
    return: int
    """
    if not dates:
        # return 0 when dates is empty
        return 0
    maxDays = 1
    maxSubDays = 1
    for i, currDay in enumerate(dates):
        nextIdx = i + 1
        if nextIdx >= len(dates):
            break
        if isYesterday(currDay, dates[nextIdx]):
            maxSubDays += 1
        else:
            maxDays = max(maxDays, maxSubDays)
            maxSubDays = 1
    maxDays = max(maxDays, maxSubDays)
    return maxDays


def GetRecentConsecutiveDays(dates):
    if not dates:
        # return 0 when dates is empty
        return 0
    result = 1
    for i, currDay in enumerate(dates):
        nextIdx = i + 1
        if nextIdx >= len(dates):
            break
        if isYesterday(currDay, dates[nextIdx]):
            result += 1
        else:
            return result
    return result
