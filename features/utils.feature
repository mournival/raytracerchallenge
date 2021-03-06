#noinspection CucumberUndefinedStep,NonAsciiCharacters
Feature: Utils

  Scenario Outline: Parse Args
    Given number n ← <arg>
    Then parseArg(n) = <value>

    Examples:
      | arg        | value    |
      | 2          | 2        |
      | -2         | -2       |
      | 1.125      | 1.125    |
      | -1.125     | -1.125   |
      | 160/532    | 0.30075  |
      | -160/532   | -0.30075 |
      | 160 / 532  | 0.30075  |
      | -160 / 532 | -0.30075 |
      | √2         | 1.4142   |
      | -√2        | -1.4142  |
      | √2 / 10    | 0.14142  |
      | -√2 / 10   | -0.14142 |
      | √2/10      | 0.14142  |
      | -√2/10     | -0.14142 |
      | √2/2       | 0.7071   |
      | -√2/2      | -0.7071  |
      | π / 3      | 1.0471   |
      | π/3        | 1.0471   |
      | π / 10     | 0.314159 |
      | π/10       | 0.314159 |

  Scenario Outline: Compare

    Given number lhs ← <l>
    And number rhs ← <r>
    Then Compare lhs <op> rhs

    Examples:
      | l      | op | r     |
      | 1      | == | 1.0   |
      | 1      | == | 1     |
      | -1     | != | 1     |
      | 1.0001 | == | 1     |
      | 1.001  | != | 1     |
      | 1      | != | 1.001 |
      | inf    | == | inf   |
      | -inf   | == | -inf  |
      | -inf   | != | inf   |
      | inf    | != | -inf  |
      | 0      | != | -inf  |
      | 0      | != | inf   |
      | -inf   | != | 0     |
      | inf    | != | -0    |
