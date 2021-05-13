---
title: Getting Started
author: William Bittle
layout: page
---

Getting started with dyn4j is easy.  Add dyn4j to your project's classpath, create an instance of the World class, fill it with bodies and joints, and update the simulation on a regular basis.  dyn4j does not include any rendering capabilities, so starting with the <a href="{{ site.samples_url }}">samples</a> usually yields a little more satisfying first experience.

> All binaries released are compiled against Java 1.6 and have no dependencies.

1. [Starting with the Samples](#Starting_with_the_Samples)
1. [Maven](#Maven)
1. [Download](#Download)
    * [Eclipse](#Eclipse)
    * [Command Line](#Command_Line)
1. [The Basics](#The_Basics)
    1. [Creating The World](#Creating_The_World)
    2. [Creating Bodies](#Creating_Bodies)
    3. [Creating Joints](#Creating_Joints)
    4. [General Creation Tips](#General_Creation_Tips)
    5. [Integrating Into The Game Loop](#Integrating_Into_The_Game_Loop)
    6. [Exceptions](#Exceptions)
    7. [Extra Help](#Extra_Help)

<a id="Starting_with_the_Samples"></a>

## Starting with the Samples
The quickest way to get started with [dyn4j](/) is to clone the [dyn4j-samples]({{ site.samples_url }}) project and run it locally.  The 2 minute video below will walk you through the process using the [Eclipse IDE](https://www.eclipse.org/downloads/packages/), but the steps should be similar for other IDEs or even the command line.

Starting with the samples project has a number of benefits:

* The result is more satisifying because the samples implement keyboard/mouse iteraction and the output is visible (dyn4j itself has no rendering capability)
* The project should compile and run without any modification which allows you to avoid any tooling setup while evaluating the library
* The project contains a number of common usage scenarios that you could build off of
* The project allows you to build off of it's simple framework to do POCs much quicker

> Keep in mind that the [samples project]({{ site.samples_url }}) is not representative of how you should or shouldn't build your application, but rather a starting point with a number of ideas on how to achieve certain behaviors.

<div class="ratio ratio-16x9 mb-3">
    <iframe src="https://www.youtube.com/embed/OqOcT8z-m_w" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<a id="Maven"></a>

## Maven
dyn4j is a Maven project and deployed to [Maven Central]({{ site.maven_url }}) and [GitHub Packages]({{ site.packages_url }}).  If your project is a Maven project, add the follow dependency to your pom.xml.

```xml
<dependency>
    <groupId>org.dyn4j</groupId>
    <artifactId>dyn4j</artifactId>
    <version>4.1.4</version>
</dependency>
```

<a id="Download"></a>

## Download
If you are not using Maven, you can download any version of dyn4j from <strong><a href="{{ site.maven_url }}" target="_blank">Maven Central</a> or <a href="{{ site.packages_url }}" target="_blank">GitHub Packages</a></strong>.  In this scenario, you need to download the dyn4j.jar (only) and add it to your modulepath/classpath.

<a id="Eclipse"></a>

#### Eclipse
For Eclipse perform the following steps:

* Copy the dyn4j.jar file to your project in eclipse.
* Right click on it and select Build Path → Add to Build Path

<a id="Command_Line"></a>

#### Command Line
When building your project on the command line add the jar in the -modulepath or -classpath flag for example:

```console
javac ... -classpath /path/to/jars/dyn4j.jar
```

<a id="The_Basics"></a>

## The Basics
Let's start with some basics about how your game interfaces with the physics engine.  dyn4j has a complex pipeline that handles collision detection and resolution and operates on objects of type `Body`.  Bodies represent things like crates, the ground, a lever, or anything that you want to exhibit physical behavior.  Bodies can be coupled together to form `Joint`s as well.  These Joints represent mechanical connections that limit the joined bodies motion.  Finally, the bodies and joints are added to a `World` which handles the actual simulation.

In general, to setup a simulation you would follow these steps:

* Create a `World` instance
* Create your Bodies and add them to the `World`
* Create your Joints and add them to the `World`

> Take a look at the sample applications provided in the [Samples]({{ site.samples_url }}) repository for both a simple Java2D rendering/input framework and for examples of common behaviors.

Once the initial state of the `World` is defined, you need to call the `World.update(double)` method when you want to advance the simulation.  The first argument to this method is the elapsed time since the last call in seconds.

> NOTE: dyn4j is **not** thread-safe and updates to the `World` should occur on the same thread.  The initial construction of the `World` can happen on a different thread however.

> NOTE: dyn4j is configured (by default) for the MKS (meters-kilograms-seconds) measuring system.  A common pitfall is using pixels for length which causes what appears to be a sluggish simulation - **don't use pixel measurements**.

<a id="Creating_The_World"></a>

#### Creating the World
The `World` class is in the `org.dyn4j.world` package.  To create the world object for your game you only need to pass it a `Bounds` object, though this is optional.  The bounds object controls the maximum bounds of the scene.  If an `Body` travels (fully) outside the bounds the state of the body will be set to inactive and will no longer interact with the other bodies or joints in the world.

Most games will use the provided `AxisAlignedBounds` class which defines a rectangular area. You can also use the default constructor of the world to with no bounds. Be careful when doing this since numeric overflow can happen.

Once the `World` is created there a number of things you may want to configure.  The most common configurable item is gravity.  The default gravity is 9.8 m/s pointing in the negative y direction.  Refer to the [Javadocs]({{ site.javadoc_url }}) for more information on other configuration items.

<a id="Creating_Bodies"></a>

#### Creating Bodies
A `Body` represents any object in your scene that you want to interact with other objects using physics.  A body can be comprised of one or more `Convex` `Shape`s. Each shape must be wrapped in a `Fixture` (to be more specific a `BodyFixture`). This provides a clear distinction between geometry and dynamics by adding the extra information for a shape such as density, friction, and restitution.

Here is a simple diagram explaining the relationships between `Body`, `Fixture`, and `Shape`:

{% include figure.html name="body-structure.png" caption="Figure 1: The composition of a Body" %}

There are a number of convex shapes provided including `Circle`, `Polygon`, `Rectangle`, etc., all contained in the `org.dyn4j.geometry` package.  Here are a few tips to creating shapes:

* You can also use any methods in the `Geometry` class for alternate ways to create shapes.
* `Rectangle` and `Circle` objects created always have their center at (0, 0).  `Segments`, `Polygons`, and `Triangles` have their centers at the center of the points (average or area based center).
* Some of the shape creation methods in the Geometry class create shapes with their centers at the origin. All the methods in the Geometry class make copies of the input points and arrays.
* Only convex shapes are supported. Concave shapes are supported by decomposing the concave shape into multiple convex shapes (dyn4j provides classes to perform the decomposition of simple polygons).

After creating the desired shape you can do two things to add it to a body. You can create a new `BodyFixture` object passing the shape to it, configure it, then add it to the body by using the `Body.addFixture(BodyFixture)` method. Or you can use the `Body.addFixture(Convex)` method to create a default fixture that will automatically be added to the body and returned so you can configure it.

If you use multiple shapes for a body use the Shape class's translate and rotate methods to place the shape at the right position and orientation in local coordinates.

> Note: This directly modifies the shape's vertices and center.

The mass of a body is created by its respective shapes.  Each shape type contains a `createMass` method which will use the geometry and the density configured in its respective BodyFixture to create a `Mass` object.  The density units are $$ \frac{kg}{m^2} $$. The density for a shape is set via the `BodyFixture.setDensity(double)` method in the BodyFixture class.

After adding shapes/fixtures to your body, be sure to call one of the `Body.setMass(MassType)` methods to set the mass. The default mass is an infinite mass centered at the origin.

> You can use the `MassType` parameter to create specialized masses like infinite mass bodies.

The setMass methods will also compute what is called the rotation disc radius. This is used in continuous collision detection and is dependent on the center of mass being computed.

> NOTE: Anytime the fixtures, shapes, density, etc. change for a body, you should call the `Body.updateMass()` method.

> The rotation disc radius is the radius of the disc created by a rotating body (imagine a body rotated 360 degrees about its center).

Finally add the body to the world by calling the `World.addBody(Body)` method.

<a id="Creating_Joints"></a>

#### Creating Joints
A `Joint` represents a connection between two bodies that limit motion.  A connection might be a frame of a car connecting two wheels or a spring connecting a wheel to a car frame.

All joint classes are contained in the `org.dyn4j.dynamics.joint` package.  All the joint classes have minimal constructors, accepting the bodies, anchor points, etc.  Configuration of motors, limits, springs, etc. are configured through the respective `Joint.set` methods.  Joints include `RevoluteJoint`, `PrismaticJoint`, `DistanceJoint`, and others.

Once the joint is created it can be added to a world by calling the `World.addJoint(Joint)` method.

> NOTE: To add a joint to a world, the bodies joined must already be added to the world.

See the [Joints]({{ site.pages_url }}/joints/) page for more details about the joints offered by dyn4j.

<a id="General_Creation_Tips"></a>

#### General Creation Tips

Like mentioned in the Joints section above the most objects have minimal constructors.  This allows for less confusion in the source.  For example the `DistanceJoint` class only accepts two anchor points and the bodies. To use the optional features, like limits, call the setter methods after creation of the object:

```java
// creates a standard fixed distance joint
DistanceJoint dj = new DistanceJoint(b1, b2, p1, p2);
// to make it a spring-damper
dj.setFrequency(8.0);
dj.setDampingRatio(0.4);

// or for a RevoluteJoint
RevoluteJoint rj = new RevoluteJoint(wheel, frame, pivot);
// to use a motor
rj.setMotorSpeed(Math.PI);
rj.setMaximumMotorTorque(1000);
rj.setMotorEnabled(true);

// or for a fixture
BodyFixture f = new BodyFixture(rect);
f.setDensity(1.2);
f.setFriction(0.6);

// or for a body
Body b = new Body();
b.addFixture(f);
b.setLinearDamping(0.97);
b.setVelocity(new Vector2(0.0, 2.0));
```

<a id="Integrating_Into_The_Game_Loop"></a>

#### Integrating Into The Game Loop
Most, if not all, games use active rendering and something called a "game loop" to poll for input, update graphics, etc.  To allow the simulation, which is represented by the `World`, you must call one of the update/step methods: `World.update(double)`, `World.updatev(double)`, `World.step(int)`, etc.  The update methods must be passed the elapsed time from the last iteration <strong>in seconds</strong> whereas the step methods are looking for the number of steps to perform.

The `World.updatev(double)` method can be used if you prefer a variable time step or would like to control when the World updates yourself. The `World.update(double)` method accumulates the elapsed time until it reaches `Settings.getStepFrequency()`, at which time the simulation is updated.  The `World.step(int)` methods are useful when you want to manually step through the simulation.

> NOTE: Variable time steps can reduce accuracy and stability.

<a id="Exceptions"></a>

#### Exceptions
There are a number of `RuntimeException`s that are thrown. Exceptions like these are typically thrown when the creation of an object fails due to invalid arguments. These exceptions should rarely occur.

For example, adding a null Body to the World object throws a `NullPointerException`. The runtime exceptions you may encounter include:

* `NullPointerException` - usually caused by passing null instead of a object reference to a constructor or setXXX method.
* `IllegalArgumentException` - usually caused by passing an invalid value that has a predefined range or restriction.
* `UnsupportedOperationException` - usually caused by attempting to modify an immutable object.
* `IndexOutOfBoundsException` - usually caused by referencing an index of a BodyFixture, Shape, etc. that is out of bounds. Can also be caused by supplying the wrong sized list or array to a method that expects a certain size.

Most of these exceptions are obvious or documented in the source and [Javadocs]({{ site.javadoc_url }}) (using text like "in the range of [0, 1]") or by `@throws` javadoc documentation.

<a id="Extra_Help"></a>

#### Extra Help
For additional help see the following links:

* [FAQ]({{ site.pages_url }}/frequently-asked-questions)
* [Samples]({{ site.samples_url }})
* [Advanced]({{ site.pages_url }}/advanced)
* [Joints]({{ site.pages_url }}/joints)
* [Javadocs]({{ site.javadoc_url }})
* [Release Notes]({{ site.release_notes_url }})
* [License]({{ site.license_url }})
* [Source]({{ site.github_url }})
* [Discussions]({{ site.discussions_url }})