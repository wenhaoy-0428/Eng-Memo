from django.test import TestCase
from .libs import GetLongestConsecutiveDays
from datetime import datetime


class TEST_GetLongestConsecutiveDays(TestCase):
    def setUp(self):
        pass

    def test_0001(self):
        dates = [
            datetime(2023, 5, 16),
            datetime(2023, 5, 15),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 1)

    def test_0002(self):
        dates = [
            datetime(2023, 5, 16),
            datetime(2023, 5, 15),
            datetime(2023, 5, 14),

            datetime(2023, 5, 12),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 2)

    def test_0003(self):
        dates = [
            datetime(2023, 5, 16),
            datetime(2023, 5, 15),
            datetime(2023, 5, 14),

            datetime(2023, 5, 12),
            datetime(2023, 5, 11),
            datetime(2023, 5, 10),
            datetime(2023, 5, 9),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 3)

    def test_0004(self):
        dates = [
            datetime(2023, 5, 14),

            datetime(2023, 5, 12),
            datetime(2023, 5, 11),
            datetime(2023, 5, 10),
            datetime(2023, 5, 9),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 3)

    def test_0005(self):
        dates = [
            datetime(2023, 5, 14),

            datetime(2023, 5, 12),
            datetime(2023, 5, 11),

            datetime(2023, 5, 9),
            datetime(2023, 5, 8),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 1)

    def test_0006(self):
        dates = [
            datetime(2023, 5, 14),

            datetime(2023, 5, 12),
            datetime(2023, 5, 11),

            datetime(2023, 5, 9),
            datetime(2023, 5, 8),
            datetime(2023, 5, 7),
        ]
        num = GetLongestConsecutiveDays(dates)
        self.assertIs(num, 2)
