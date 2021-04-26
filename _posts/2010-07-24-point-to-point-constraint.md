---
id: 372
title: Point-to-Point Constraint
date: 2010-07-24 00:47:38 -0500
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=225
permalink: /2010/07/point-to-point-constraint/
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
As the first entry after the Equality Constraints post, we will perform the derivation of the Point-to-Point constraint, which models a Revolute Joint, in 2D.  

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [Position Constraint](#ptp-position)
  4. [The Derivative](#ptp-derivative)
  5. [Isolate The Velocities](#ptp-isolate)
  6. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>

## Problem Definition
It's probably good to start with a good definition of what we are trying to accomplish. From the last post on equality constraints it may not be clear what we are trying to do.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for a Point-to-Point constraint which models a Revolute Joint. 

<a name="ptp-process"></a>  

## Process Overview
Since this is the first specific constraint I'll post on, we need to go through how we actually perform the derivation.

<a href="http://www.box2d.com/" target="_blank">Erin Cato</a> lays out the process quite simply:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using this formula we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the $$ K $$ matrix. The $$ K $$ matrix is the $$ A $$ in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-position"></a>  

## Position Constraint
So the first step is to write out an equation that describes the constraint. A Revolute Joint should allow the two bodies to rotate about a common point $$ \vec{p} $$, but should not allow them to translate away or towards each other. In other words:

$$
C = \vec{p_a} - \vec{p_b} = 0
$$

which says the anchor points $$ \vec{p_a} $$ and $$ \vec{p_b} $$ on body A and B respectively must be the same point. This allows the bodies to translate freely, but only together, and rotate freely about the anchor point.

<a name="ptp-derivative"></a>

## The Derivative
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.

> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

First lets understand how $$ \vec{p_a} $$ and $$ \vec{p_b} $$ are defined:

$$
\begin{align}
\vec{p_a} &= \vec{c_a} + R_a\vec{r_a} \\
\vec{p_b} &= \vec{c_b} + R_b\vec{r_b}
\end{align}
$$

where $$ \vec{c_a} $$ and $$ \vec{c_b} $$ are the _world space_ centers of mass of body A and B respectively, $$ \vec{r_a} $$ and $$ \vec{r_b} $$ are the _local space_ vectors from the _local space_ center of mass to the _local space_ anchor point, and $$ R_a $$ and $$ R_b $$ are the rotation matrices of body A and B.  This means that the _world space_ anchor point for either body is the sum of the _world space_ center of mass plus the _world space_ vector from the _local space_ center of mass to the _local space_ anchor point (transformed by the body's rotation matrix).  This definition gives us the position of the anchor point relative to each body.

> Note that the _local space_ anchor point for Body A and B will be different, but doesn't not change over time.

Then by subsitution:

$$
C = \vec{c_a} + R_a\vec{r_a} - \vec{c_b} - R_b\vec{r_b}
$$

Now that the constraint is written in the correct variables we can perform the derivative.  To do this, we need to identify what components are time dependent.  The position of the bodies are obviously time dependent.  The rotation matrices are also time dependent.  The $$ \vec{r} $$ vectors on the other hand are not - they are locally defined and constant over time.  

Another trick here is how to take the derivative of the $$ R\vec{r} $$ product.  This turns out to be pretty simple as [described here](https://en.wikipedia.org/wiki/Rotating_reference_frame#Time_derivatives_in_the_two_frames).  For reference, the following identity applies:

$$
\frac{d(R\vec{r})}{dt} = w \times \vec{r}
$$

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

Writing out the derivative we have:

$$
\begin{align}
\frac{d(C)}{dt} &= \vec{v_a} + \frac{d(R_a\vec{r_a})}{dt} - \vec{v_b} - \frac{d(R_b\vec{r_b})}{dt} \\
&= \vec{v_a} + w_a \times \vec{r_a} - \vec{v_b} - w_b \times \vec{r_b}
\end{align}
$$

<a name="ptp-isolate"></a>  

## Isolate The Velocities
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

The linear velocities are already isolated so we can ignore those for now. The angular velocities on the other hand have a pesky cross product. In 3D, we can use the identity that a cross product of two vectors is the same as the multiplication by a skew symmetric matrix and the other vector; see <a href="http://en.wikipedia.org/wiki/Cross_product" target="_blank">here</a>. For 2D, we can do something similar by examining the cross product itself:

$$
\begin{align}
w \times \vec{r} &= \begin{bmatrix} -wr_y \\ wr_x \end{bmatrix} \\
&= \begin{bmatrix} -r_y \\ r_x \end{bmatrix}w \\
&= R_sw
\end{align}
$$

> Remember that the angular velocity in 2D is a scalar.

Removing the cross products using the process above yields:

$$
\frac{d(C)}{dt} = \vec{v_a} + R_{sa}w_a - \vec{v_b} - R_{sb}w_b
$$

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

$$
\frac{d(C)}{dt} = \begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix}
$$

And, by inspection, we obtain the Jacobian:

$$
J = \begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \end{bmatrix}
$$

Where $$ I_{2x2} $$ is a 2x2 identity matrix.

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

The $$ \vec{b} $$ vector is fairly straight forward to compute. Therefore I'll skip that and compute the $$ K $$ matrix symbolically:

$$
JM^{-1}J^T = \begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix} I_{2x2} \\ R_{sa}^T \\ -I_{2x2} \\ -R_{sb}^T \end{bmatrix}
$$

> Note that the transpose of a block matrix is the transpose of the elements.

> Also note that the transpose of the identity matrix is the identity matrix, i.e. $$ I_{nxn}^T = I_{nxn} $$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix} M_a^{-1} & R_{sa}I_a^{-1} & -M_b^{-1} & -R_{sb}I_b^{-1} \end{bmatrix}
\begin{bmatrix} I_{2x2} \\ R_{sa}^T \\ -I_{2x2} \\ -R_{sb}^T \end{bmatrix}
$$

Multiplying left to right again:

$$
JM^{-1}J^T = M_a^{-1} + R_{sa}I_a^{-1}R_{sa}^T + M_b^{-1} + R_{sb}I_b^{-1}R_{sb}^T
$$

Now if we write out the equation element wise (remembering that $$ I^{-1} $$ is a scalar in 2D):

$$
JM^{-1}J^T = 
  \begin{bmatrix} m_a^{-1} & 0 \\ 0 & m_a^{-1} \end{bmatrix} 
+ \begin{bmatrix} -r_{ay}I_a^{-1} \\ r_{ax}I_a^{-1} \end{bmatrix} \begin{bmatrix} -r_{ay} & r_{ax} \end{bmatrix}
+ \begin{bmatrix} m_b^{-1} & 0 \\ 0 & m_b^{-1} \end{bmatrix} 
+ \begin{bmatrix} -r_{by}I_b^{-1} \\ r_{bx}I_b^{-1} \end{bmatrix} \begin{bmatrix} -r_{by} & r_{bx} \end{bmatrix}
$$

Multiplying the matrices and adding them yields:

$$
\begin{align}
JM^{-1}J^T &= 
  \begin{bmatrix} m_a^{-1} & 0 \\ 0 & m_a^{-1} \end{bmatrix} 
+ \begin{bmatrix} r_{ay}I_a^{-1}r_{ay} & -r_{ay}I_a^{-1}r_{ax} \\ -r_{ax}I_a^{-1}r_{ay} & r_{ax}I_a^{-1}r_{ax} \end{bmatrix}
+ \begin{bmatrix} m_b^{-1} & 0 \\ 0 & m_b^{-1} \end{bmatrix} 
+ \begin{bmatrix} r_{by}I_b^{-1}r_{by} & -r_{by}I_b^{-1}r_{bx} \\ -r_{bx}I_b^{-1}r_{by} & r_{bx}I_b^{-1}r_{bx} \end{bmatrix} \\
&= 
  \begin{bmatrix} m_a^{-1} & 0 \\ 0 & m_a^{-1} \end{bmatrix} 
+ \begin{bmatrix} I_a^{-1}r_{ay}r_{ay} & -I_a^{-1}r_{ay}r_{ax} \\ -I_a^{-1}r_{ax}r_{ay} & I_a^{-1}r_{ax}r_{ax} \end{bmatrix}
+ \begin{bmatrix} m_b^{-1} & 0 \\ 0 & m_b^{-1} \end{bmatrix} 
+ \begin{bmatrix} I_b^{-1}r_{by}r_{by} & -I_b^{-1}r_{by}r_{bx} \\ -I_b^{-1}r_{bx}r_{by} & I_b^{-1}r_{bx}r_{bx} \end{bmatrix} \\
&= 
  \begin{bmatrix} m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ay}r_{ay} + I_b^{-1}r_{by}r_{by} & -I_a^{-1}r_{ay}r_{ax} - I_b^{-1}r_{by}r_{bx} \\ 
  -I_a^{-1}r_{ax}r_{ay} - I_b^{-1}r_{bx}r_{by} & m_a^{-1} + m_b^{-1} + I_a^{-1}r_{ax}r_{ax} + I_b^{-1}r_{bx}r_{bx} \end{bmatrix} 
\end{align}
$$

Plug the values of the $$ K $$ matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the $$ K $$ matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the $$ K $$ matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.