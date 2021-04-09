---
id: 440
title: Prismatic Constraint
date: 2011-03-12T18:52:03-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=375
permalink: /2011/03/prismatic-constraint/
categories:
  - Blog
  - Constrained Dynamics
  - Game Development
  - Physics
tags:
  - Constrained Dynamics
  - Equality Constraints
  - Game Development
  - Physics
---
The next equality constraint we will derive is the prismatic constraint. A prismatic constraint is like the line constraint except it does not allow rotation about the anchor point. A prismatic constraint constraints the linear motion of the bodies along a line. An example of a prismatic joint is the slide of a semi-automatic pistol. The slide is moved back to charge the weapon, then released to its original position. The slide cannot rotate about the pistol, nor can it move up/down or left/right only along one axis.  

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [The Jacobian](#ptp-jacobian)
  4. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>  

## Problem Definition  
It's probably good to start with a good definition of what we are trying to accomplish.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for a Prismatic constraint.

<a name="ptp-process"></a>  

## Process Overview
Let's review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the $$ A $$ in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-jacobian"></a>  

## The Jacobian
As earlier stated, the Prismatic Joint is just like the Line Joint only it does not allow rotation about the anchor point. Because of this, we can formulate the Prismatic Joint by combining two joints: Line Joint and Angle Joint. This allows us to skip directly to the Jacobian:

$$
J = \begin{bmatrix}
  \vec{t^T} & \vec{r_a} \times \vec{t} & -\vec{t^T} & -(\vec{r_b} + \vec{u}) \times \vec{t}\\
  0 & 1 & 0 & -1
\end{bmatrix}
$$

> See the "Line Constraint" and "Angle Constraint" posts for the derivation of their Jacobians.

<a name="ptp-kmatrix"></a>  

## Compute The K Matrix  
Lastly, to solve the constraint we need to compute the values for $$ A $$ (I use the name K) and $$ \vec{b} $$:

> See the "Equality Constraints" post for the derivation of the $$ A $$ matrix and $$ \vec{b} $$ vector.

$$
\begin{align}
A\vec{x} &= \vec{b} \\
A &= JM^{-1}J^T \\
\vec{x} &= \vec{\lambda} \\
\vec{b} &= -J\vec{v_i}
\end{align}
$$

The b vector is fairly straight forward to compute. Therefore I'll skip that and compute the K matrix symbolically:

$$
JM^{-1}J^T = \begin{bmatrix}
  \vec{t^T} & \vec{r_a} \times \vec{t} & -\vec{t^T} & -(\vec{r_b} + \vec{u}) \times \vec{t}\\
  0 & 1 & 0 & -1
\end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
\vec{t} & 0\\
\vec{r_a} \times \vec{t} & 1\\
-\vec{t} & 0\\
-(\vec{r_b} + \vec{u}) \times \vec{t} & -1
\end{bmatrix}
$$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix}
  \vec{t^T}M_a^{-1} & (\vec{r_a} \times \vec{t})I_a^{-1} & -\vec{t^T}M_b^{-1} & -((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1}\\
  0 & I_a^{-1} & 0 & -I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
\vec{t} & 0\\
\vec{r_a} \times \vec{t} & 1\\
-\vec{t} & 0\\
-(\vec{r_b} + \vec{u}) \times \vec{t} & -1
\end{bmatrix}
$$

Multiplying left to right again:

$$
JM^{-1}J^T = \begin{bmatrix}
  \vec{t^T}M_a^{-1}\vec{t} + (\vec{r_a} \times \vec{t})I_a^{-1}(\vec{r_a} \times \vec{t}) + \vec{t^T}M_b^{-1}\vec{t} + ((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1}((\vec{r_b} + \vec{u}) \times \vec{t}) & (\vec{r_a} \times \vec{t})I_a^{-1} + ((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1}\\
  (\vec{r_a} \times \vec{t})I_a^{-1} + ((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1} & I_a^{-1} + I_b^{-1}
\end{bmatrix}
$$

If we use the following just to clean things up:

$$
\begin{align}
s_a &= \vec{r_a} \times \vec{t} \\
s_b &= (\vec{r_b} + \vec{u}) \times \vec{t} \\
\end{align}
$$

We get:

$$
JM^{-1}J^T = \begin{bmatrix}
  \vec{t^T}M_a^{-1}\vec{t} + s_aI_a^{-1}s_a + \vec{t^T}M_b^{-1}\vec{t} + s_bI_b^{-1}s_b & s_aI_a^{-1} + s_bI_b^{-1}\\
  s_aI_a^{-1} + s_bI_b^{-1} & I_a^{-1} + I_b^{-1}
\end{bmatrix}
$$

And if $$ \vec{t} $$ is normalized we get:

$$
JM^{-1}J^T = \begin{bmatrix}
  M_a^{-1} + s_a^2I_a^{-1} + M_b^{-1} + s_b^2I_b^{-1} & s_aI_a^{-1} + s_bI_b^{-1}\\
  s_aI_a^{-1} + s_bI_b^{-1} & I_a^{-1} + I_b^{-1}
\end{bmatrix}
$$

Plug the values of the K matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.