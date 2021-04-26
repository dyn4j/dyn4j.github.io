---
id: 437
title: Weld Constraint
date: 2010-12-30 00:05:41 -0500
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=337
permalink: /2010/12/weld-constraint/
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
The next equality constraint we will derive is the weld constraint. A weld constraint can be used to join two bodies at an anchor point in which the bodies must move and rotate together (all DOF are constrained).

> This post will differ slightly from the previous posts. A weld joint is basically a revolute joint + an angle joint. In that case we can use the resulting Jacobians from those posts to skip a bit of the work.

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [The Jacobian](#ptp-jacobian)
  4. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>  

## Problem Definition  
It's probably good to start with a good definition of what we are trying to accomplish.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for a Weld constraint.  

<a name="ptp-process"></a>  

## Process Overview
Let's review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the $$ K $$ matrix. The $$ K $$ matrix is the $$ A $$ in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-jacobian"></a>  

## The Jacobian
Like stated above, the weld constraint is just a combination of two other constraints: point-to-point and angle constraints. As such, we can simply combine the Jacobians we found for those constraints into one Jacobain:

$$
J = \begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \\
0 & 1 & 0 & -1
\end{bmatrix}
$$

where:

$$
\begin{align}
I_{2x2} &= \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix} \\
R_s &= \begin{bmatrix} -r_{sy} \\ r_{sx} \end{bmatrix}
\end{align}
$$

> Note that $$ I_{2x2} $$ is just a 2D identity matrix.

See the "Point-to-Point Constraint" and "Angle Constraint" posts for the derivation of their Jacobians.

<a name="ptp-kmatrix"></a> 

## Compute The K Matrix
Lastly, to solve the constraint we need to compute the values for $$ A $$ (I use the name $$ K $$) and $$ \vec{b} $$:

> See the "Equality Constraints" post for the derivation of the $$ A $$ matrix and $$ \vec{b} $$ vector.

$$
\begin{align}
A\vec{x} &= \vec{b} \\
A &= JM^{-1}J^T \\
\vec{x} &= \vec{\lambda} \\
\vec{b} &= -J\vec{v_i}
\end{align}
$$

For this constraint the $$ \vec{b} $$ vector computation isn't as simple as in past constraints. So I'll work this out as well:

$$
\begin{align}
\vec{b} &= -\begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \\
0 & 1 & 0 & -1
\end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix} \\
&= -\begin{bmatrix} \vec{v_a} + R_{sa}w_a - \vec{v_b} - R_{sb}w_b \\
w_a - w_b
\end{bmatrix} \\
&= -\begin{bmatrix} \vec{v_a} + (w_a \times \vec{r_a}) - \vec{v_b} - (w_b \times \vec{r_b}) \\
w_a - w_b
\end{bmatrix} \\
&= \begin{bmatrix} \vec{v_b} + (w_b \times \vec{r_b}) - \vec{v_a} - (w_a \times \vec{r_a}) \\
w_b - w_a
\end{bmatrix}
\end{align}
$$

> Notice here that the first element in the $$ \vec{b} $$ vector is a vector also. This makes the $$ \vec{b} $$ vector a 3x1 vector instead of the normal 2x1 that we have seen thus far.

Now on to computing the $$ K $$ matrix:

$$
JM^{-1}J^T = \begin{bmatrix}
  I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb}  \\
  0 & 1 & 0 & -1
\end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
I_{2x2} & 0\\
R_{sa}^T & 1\\
-I_{2x2} & 0\\
-R_{sb}^T & -1
\end{bmatrix}
$$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix}
  M_a^{-1} & R_{sa}I_a^{-1} & -M_b^{-1} & -R_{sb}I_b^{-1}  \\
  0 & I_a^{-1} & 0 & -I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
I_{2x2} & 0\\
R_{sa}^T & 1\\
-I_{2x2} & 0\\
-R_{sb}^T & -1
\end{bmatrix}
$$

Multiplying left to right again:

$$
K = JM^{-1}J^T = \begin{bmatrix}
  M_a^{-1} + R_{sa}I_a^{-1}R_{sa}^T + M_b^{-1} + R_{sb}I_b^{-1}R_{sb}^T & R_{sa}I_a^{-1} + R_{sb}I_b^{-1} \\
  I_a^{-1}R_{sa}^T + I_b^{-1}R_{sb}^T & I_a^{-1} + I_b^{-1}
\end{bmatrix}
$$

Unlike previous posts, some of the elements in the above matrix are matrices themselves. When we multiply out the elements we'll see that the resulting $$ K $$ matrix is actually a 3x3 matrix.

> It makes sense that the $$ K $$ matrix is a 3x3 because the $$ \vec{b} $$ vector was a 3x1, meaning we have 3 variables to solve for. The $$ \vec{b} $$ vector and $$ K $$ matrix dimensions must match.

So lets take each element and work them out separately, starting with the first element. We can actually copy the result from the Point-to-Point constraint post since its exactly the same:

> Remember that $$ R_s^T = \begin{bmatrix} -r_{sy} & r_{sx} \end{bmatrix} $$

$$
\begin{align}
K_{(0, 0)} &= M_a^{-1} + R_{sa}I_a^{-1}R_{sa}^T + M_b^{-1} + R_{sb}I_b^{-1}R_{sb}^T \\
&= \begin{bmatrix} m_a^{-1} & 0 \\ 0 & m_a^{-1} \end{bmatrix} + \begin{bmatrix} -I_a^{-1}r_{ay} \\ I_a^{-1}r_{ax} \end{bmatrix} \begin{bmatrix} -r_{ay} & r_{ax} \end{bmatrix} + \begin{bmatrix} m_b^{-1} & 0 \\ 0 & m_b^{-1} \end{bmatrix} + \begin{bmatrix} -I_b^{-1}r_{by} \\ I_b^{-1}r_{bx} \end{bmatrix} \begin{bmatrix} -r_{by} & r_{bx} \end{bmatrix} \\
&= \begin{bmatrix} m_a^{-1} & 0 \\ 0 & m_a^{-1} \end{bmatrix} + \begin{bmatrix} I_a^{-1}r_{ay}r_{ay} & -I_a^{-1}r_{ay}r_{ax} \\ -I_a^{-1}r_{ay}r_{ax} & I_a^{-1}r_{ax}r_{ax} \end{bmatrix} + \begin{bmatrix} m_b^{-1} & 0 \\ 0 & m_b^{-1} \end{bmatrix} + \begin{bmatrix} I_b^{-1}r_{by}r_{by} & -I_b^{-1}r_{by}r_{bx} \\ -I_b^{-1}r_{by}r_{bx} & I_b^{-1}r_{bx}r_{bx} \end{bmatrix} \\
&= \begin{bmatrix}
  m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ay}r_{ay} + I_b^{-1}r_{by}r_{by} & -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} \\
  -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} & m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ax}r_{ax} + I_b^{-1}r_{bx}r_{bx}
\end{bmatrix} \\ \\

K_{(0, 1)} &= R_{sa}I_a^{-1} + R_{sb}I_b^{-1} \\
&= \begin{bmatrix} -I_a^{-1}r_{ay} \\ I_a^{-1}r_{ax} \end{bmatrix} + \begin{bmatrix} -I_b^{-1}r_{by} \\ I_b^{-1}r_{bx} \end{bmatrix} \\
&= \begin{bmatrix} -I_a^{-1}r_{ay} - I_b^{-1}r_{by} \\ I_a^{-1}r_{ax} + I_b^{-1}r_{bx} \end{bmatrix} \\ \\

K_{(1, 0)} &= I_a^{-1}R_{sa}^T + I_b^{-1}R_{sb}^T \\
&= \begin{bmatrix} -I_a^{-1}r_{ay} & I_a^{-1}r_{ax} \end{bmatrix} + \begin{bmatrix} -I_b^{-1}r_{by} & I_b^{-1}r_{bx} \end{bmatrix} \\
&= \begin{bmatrix} -I_a^{-1}r_{ay} - I_b^{-1}r_{by} & I_a^{-1}r_{ax} + I_b^{-1}r_{bx} \end{bmatrix}
\end{align}
$$

Lastly the last element $$ K_{(1, 1)} $$ can be left as-is since its just a scalar.

Now adding all these elements back into one big matrix we obtain:

$$
\begin{align}
K &= \begin{bmatrix}
K_{(0, 0)} & K_{(0, 1)} \\ K_{(1, 0)} & K_{(1, 1)}
\end{bmatrix} \\
&= \begin{bmatrix}
  \begin{bmatrix} m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ay}r_{ay} + I_b^{-1}r_{by}r_{by} & -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} \\ -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} & m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ax}r_{ax} + I_b^{-1}r_{bx}r_{bx} \end{bmatrix} & \begin{bmatrix} -I_a^{-1}r_{ay} - I_b^{-1}r_{by} \\
   I_a^{-1}r_{ax} + I_b^{-1}r_{bx} \end{bmatrix} \\
  \begin{bmatrix} -I_a^{-1}r_{ay} - I_b^{-1}r_{by} & I_a^{-1}r_{ax} + I_b^{-1}r_{bx} \end{bmatrix} & I_a^{-1} + I_b^{-1}
\end{bmatrix} \\
&= \begin{bmatrix}
  m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ay}r_{ay} + I_b^{-1}r_{by}r_{by} & -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} & -I_a^{-1}r_{ay} - I_b^{-1}r_{by} \\
  -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} & m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ax}r_{ax} + I_b^{-1}r_{bx}r_{bx} & I_a^{-1}r_{ax} + I_b^{-1}r_{bx} \\
  -I_a^{-1}r_{ay} - I_b^{-1}r_{by} & I_a^{-1}r_{ax} + I_b^{-1}r_{bx} & I_a^{-1} + I_b^{-1}
\end{bmatrix}
\end{align}
$$

Plug the values of the $$ K $$ matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the $$ K $$ matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the $$ K $$ matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.