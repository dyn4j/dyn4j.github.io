---
title: Frequently Asked Questions
author: William Bittle
layout: page
---

1. [What is dyn4j?](#What_is_dyn4j)
2. [What does the license allow?](#What_does_the_license_allow)
3. [How do I get started using dyn4j?](#How_do_I_get_started_using_dyn4j)
4. [What platforms are suppored?](#What_platforms_are_suppored)
5. [I need help, where do I go?](#I_need_help_where_do_I_go)
6. [What should I know to be able to use the library?](#What_should_I_know_to_be_able_to_use_the_library)
7. [Why don't I see anything when I use the library?](#Why_dont_I_see_anything_when_I_use_the_library)
8. [The simulation isn't behaving correctly, what should I do?](#The_simulation_isnt_behaving_correctly_what_should_I_do)

<a id="What_is_dyn4j"></a>

## What is dyn4j?
dyn4j is a 2D collision detection and rigid body physics engine written 100% in the Java programming language. The library is built for Java 1.6 or higher, has zero dependencies, and is primarily developed for games.

The project as a whole includes the core library, a suite of over 2000 JUnit test cases, and a [samples]({{ site.samples_url }}) project.

Overall goals of the project are:
* A 100% Java 2D collision detection and physics library
* Java 1.6 or higher support (though this could change in future versions)
* No dependencies
* Comprehensive, automated testing
* Well documented

A side goal of the project is to serve as a well designed example of a collision detection from which others can learn the patterns, pipelines, algorithms, and more.

<a id="What_does_the_license_allow"></a>

## What does the license allow?
dyn4j uses the [New BSD license]({{ site.license_url }}). You may use the library in commercial applications without releasing your application code, or any modifications to the library, or citing attribution.

I do encourage those using or modifying the library to report any issues by using [GitHub discussions]({{ site.discussions_url }}) so that all can benefit.

<a id="How_do_I_get_started_using_dyn4j"></a>

## How do I get started using dyn4j?
See the [Getting Started]({{ site.pages_url }}/getting-started/) page first. This will help you setup your project and give you a few tips to get going. Then you can check out the [samples]({{ site.samples_url }}).  From there, I recommend that you read the [Advanced]({{ site.pages_url }}/advanced/) wiki page to learn more about key aspects of the engine.

<a id="What_platforms_are_suppored"></a>

## What platforms are suppored?
Any platform that has a Java 1.6 or higher virtual machine.  Testing is primarily performed on Windows 10 64bit with OpenJDK 11 as the runtime.  Less frequent testing occurs on Mac OS 

<a id="I_need_help_where_do_I_go"></a>

## I need help, where do I go?
The best way to get help is to first read through the [Getting Started]({{ site.pages_url }}/getting-started/) page to make sure you didn't miss anything.  Also review the [javadocs]({{ site.javadoc_url }}) as the comments there provide a lot of value.

If you have a question like "How Can I..." please review the [samples]({{ site.samples_url }}) project and any answered [discussions]({{ site.discussions_url }}) first.  Finally, if you are unable to resolve your problem or find the answer you are looking for, feel free to open a new discussion.

> If you are having problems with compilation, Java 2D, or something else unrelated to dyn4j, you'll want to use other mediums, StackOverflow, to ask/resolve your questions.

> NOTE: [GitHub Issues]({{ site.issues_url }}) are for confirmed problems with dyn4j or pending changes/enhancements. At a minimum, you should fill out the issue template with all relevant information and attach a test case.  If you aren't sure if what you are seeing is a bug, open a [discussions]({{ site.discussions_url }}) and after confirmation, an issue will be created for you.

<a id="What_should_I_know_to_be_able_to_use_the_library"></a>

## What should I know to be able to use the library?
You should, at a minimum, be very familiar with the Java programming language and the tools used to compile and run java applications (command line or IDE).  The library itself and the [samples]({{ site.samples_url }}) project are both [Maven](https://maven.apache.org/) projects developed in [Eclipse](https://www.eclipse.org/downloads/packages/), but these are not dependencies.

I would recommend that you have some basic knowledge of physical properties like, force, torque, velocity, mass, etc. In addition, it would be beneficial if you have some experience with Java2D or OpenGL.

<a id="Why_dont_I_see_anything_when_I_use_the_library"></a>

## Why don't I see anything when I use the library?
The library leaves the rendering up to you. Java has a few options for rendering, standard Java2D that is packaged with the runtime or 3rd party libraries like JOGL. You can see the [samples]({{ site.samples_url }}) for a Graphics2D example and a JOGL example. The choice of rendering API is totally up to you.  All the samples extend the Java 2D rendering framework.

> Including rendering, the library does not solve other problems like texturing, user input, networking, and so on.

<a id="The_simulation_isnt_behaving_correctly_what_should_I_do"></a>

## The simulation isn't behaving correctly, what should I do?

  1. Make sure you are using the MKS (meter-kilogram-second) system of measure (not ft/lbs or pixels).
  2. Make sure you understand that dyn4j does not produce pixel perfect results.
  3. Be very careful when reusing `Shape` instances among bodies.
  4. Read the [javadocs]({{ site.javadoc_url }}) carefully. One of the main focuses of the project was documentation, especially within the source.
  5. Take a look at the [sample]({{ site.samples_url }}) project for examples of how to properly use features of the library and for tips on how you might achieve certain common behaviors.
  6. Feel free to start a [discussion]({{ site.discussions_url }}).
  7. If you have a reproduction case and think there's a bug, submit an [issues]({{ site.issues_url }}).