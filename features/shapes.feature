#noinspection CucumberUndefinedStep
Feature: Abstract Shapes

  Scenario: The default transformation
    Given s ← test_shape()
    Then s.transform = identity_matrix

  Scenario: Assigning a transformation
    Given s ← test_shape()
    When set_transform(s, translation(2, 3, 4))
    Then s.transform = translation(2, 3, 4)

  Scenario: The default material
    Given s ← test_shape()
    When m ← s.material
    Then m = material()

  Scenario: Assigning a material
    Given s ← test_shape()
    And m ← material()
    And m.ambient ← 1
    When s.material ← m
    Then s.material = m

# I am very uncertain as to the need for these tests. In particular, the tests drive a particular
# design: a mutable object that updates saved_ray after every intersect check. Why?
#Scenario: Intersecting a scaled shape with a ray
#  Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
#    And s ← test_shape()
#  When set_transform(s, scaling(2, 2, 2))
#    And xs ← intersect(s, r)
#  Then s.saved_ray.origin = point(0, 0, -2.5)
#    And s.saved_ray.direction = vector(0, 0, 0.5)
#
#Scenario: Intersecting a translated shape with a ray
#  Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
#    And s ← test_shape()
#  When set_transform(s, translation(5, 0, 0))
#    And xs ← intersect(s, r)
#  Then s.saved_ray.origin = point(-5, 0, -5)
#    And s.saved_ray.direction = vector(0, 0, 1)
#
  Scenario: Computing the normal on a translated shape
    Given s ← test_shape()
    When set_transform(s, translation(0, 1, 0))
    And n ← normal_at(s, point(0, 1.70711, -0.70711))
    Then n = vector(0, 0.70711, -0.70711)

  Scenario: Computing the normal on a transformed shape
    Given s ← test_shape()
    And m ← scaling(1, 0.5, 1) * rotation_z(π/5)
    When set_transform(s, m)
    And n ← normal_at(s, point(0, √2/2, -√2/2))
    Then n = vector(0, 0.97014, -0.24254)

  Scenario: A shape has a parent attribute
    Given s ← test_shape()
    Then s.parent is nothing

  Scenario: Converting a point from world to object space
    Given g1 ← group()
    And set_transform(g1, rotation_y(π/2))
    And g2 ← group()
    And set_transform(g2, scaling(2, 2, 2))
    And add_child(g1, g2)
    And s ← sphere()
    And set_transform(s, translation(5, 0, 0))
    And add_child(g2, s)
    When p ← world_to_object(s, point(-2, 0, -10))
    Then p = point(0, 0, -1)

  Scenario: Converting a normal from object to world space
    Given g1 ← group()
    And set_transform(g1, rotation_y(π/2))
    And g2 ← group()
    And set_transform(g2, scaling(1, 2, 3))
    And add_child(g1, g2)
    And s ← sphere()
    And set_transform(s, translation(5, 0, 0))
    And add_child(g2, s)
    When n ← normal_to_world(s, vector(√3/3, √3/3, √3/3))
    Then n = vector(0.2857, 0.4286, -0.8571)

  Scenario: Finding the normal on a child object
    Given g1 ← group()
    And set_transform(g1, rotation_y(π/2))
    And g2 ← group()
    And set_transform(g2, scaling(1, 2, 3))
    And add_child(g1, g2)
    And s ← sphere()
    And set_transform(s, translation(5, 0, 0))
    And add_child(g2, s)
    When n ← normal_at(s, point(1.7321, 1.1547, -5.5774))
    Then n = vector(0.2857, 0.4286, -0.8571)

# Suggestions from chapter 9:
# 1. Write a test to check that a Sphere is a Shape
#    Given s ← sphere()
#    Then s is a shape
# 2. remove transform and material tests from sphere
# - Not sure. At this time, not using OO inheritance with base class.Ability:

  Scenario: Comparing Shapes
    Given a ← cone()
    And b ← cylinder()
    And c ← cube()
    And d ← sphere()
    And e ← csg("union", a, b)
    And f ← plane()
    And g ← group()
    And p1 ← point(0, 1, 0)
    And p2 ← point(-1, 0, 0)
    And p3 ← point(1, 0, 0)
    And h ← triangle(p1, p2, p3)
    Then a does not shape.equals b
    Then b does not shape.equals c
    Then c does not shape.equals d
    Then d does not shape.equals e
    Then e does not shape.equals f
    Then f does not shape.equals g
    Then g does not shape.equals h
    Then h does not shape.equals a
