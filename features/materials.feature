Feature: Materials

  Background:
    Given m ← material()
    And position ← point(0, 0, 0)

  Scenario: The default material
    Given m ← material()
    Then m.color = color(1, 1, 1)
    And m.ambient = 0.1
    And m.diffuse = 0.9
    And m.specular = 0.9
    And m.shininess = 200.0

  Scenario: Reflectivity for the default material
    Given m ← material()
    Then m.reflective = 0.0

  Scenario: Transparency and Refractive Index for the default material
    Given m ← material()
    Then m.transparency = 0.0
    And m.refractive_index = 1.0

  Scenario: Lighting with the eye between the light and the surface
    Given eyev ← vector(0, 0, -1)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 0, -10), color(1, 1, 1))
    When result ← lighting(m, light, position, eyev, normalv)
    Then result = color(1.9, 1.9, 1.9)

  Scenario: Lighting with the eye between light and surface, eye offset 45°
    Given eyev ← vector(0, √2/2, -√2/2)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 0, -10), color(1, 1, 1))
    When result ← lighting(m, light, position, eyev, normalv)
    Then result = color(1.0, 1.0, 1.0)

  Scenario: Lighting with eye opposite surface, light offset 45°
    Given eyev ← vector(0, 0, -1)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 10, -10), color(1, 1, 1))
    When result ← lighting(m, light, position, eyev, normalv)
    Then result = color(0.7364, 0.7364, 0.7364)

  Scenario: Lighting with eye in the path of the reflection vector
    Given eyev ← vector(0, -√2/2, -√2/2)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 10, -10), color(1, 1, 1))
    When result ← lighting(m, light, position, eyev, normalv)
    Then result = color(1.6364, 1.6364, 1.6364)

  Scenario: Lighting with the light behind the surface
    Given eyev ← vector(0, 0, -1)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 0, 10), color(1, 1, 1))
    When result ← lighting(m, light, position, eyev, normalv)
    Then result = color(0.1, 0.1, 0.1)

  Scenario: Lighting with the surface in shadow
    Given eyev ← vector(0, 0, -1)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 0, -10), color(1, 1, 1))
    And in_shadow ← true
    When result ← lighting(m, light, position, eyev, normalv, in_shadow)
    Then result = color(0.1, 0.1, 0.1)

  Scenario: Lighting with a pattern applied
    Given m.pattern ← stripe_pattern(color(1, 1, 1), color(0, 0, 0))
    And m.ambient ← 1
    And m.diffuse ← 0
    And m.specular ← 0
    And eyev ← vector(0, 0, -1)
    And normalv ← vector(0, 0, -1)
    And light ← point_light(point(0, 0, -10), color(1, 1, 1))
    When c1 ← lighting(m, light, point(0.9, 0, 0), eyev, normalv, false)
    And c2 ← lighting(m, light, point(1.1, 0, 0), eyev, normalv, false)
    Then c1 = color(1, 1, 1)
    And c2 = color(0, 0, 0)

  Scenario: Bad Materials Field Throws
    Given m ← material()
    Then m.not_a_field ← 0 throws

  Scenario: Comparing Materials
    Given m ← material()
    Then m material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.color ← color(1, 2, 3)
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.ambient ← 0
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.diffuse ← 0
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.specular ← 0
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.shininess ← 0
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.reflective ← 10
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.refractive_index ← 10
    Then m does not material.equals n
    Then n does not material.equals m

  Scenario: Comparing Materials
    Given m ← material()
    And n ← material()
    And n.transparency ← 10
    Then m does not material.equals n
    Then n does not material.equals m