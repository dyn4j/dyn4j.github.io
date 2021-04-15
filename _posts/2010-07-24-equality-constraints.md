---
id: 371
title: Equality Constraints
date: 2010-07-24T13:36:21-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=191
permalink: /2010/07/equality-constraints/
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
After the first release of the [dyn4j](http://www.dyn4j.org) project, I felt that it would be good to pass along what I learned about constrained dynamics.  This is not an easy subject and aside from purchasing books there's not much information out there about it for those of us not accustomed to reading research papers or theses.

Recall that in 3D, for each body, there are 6 degrees of freedom (DOF) - or ways to move: translation along the x, y, and z axes and rotation about those same axes.  In 2D, there are only 3 DOF: x, y and rotation within the x-y plane.  The DOF are what are _constrained_ to produce mechanical effects like hinges, fixed distance, limits, etc.  While constraints are typically defined as pairwise, they can be any combination. Pairwise constraints are simple to define, solve, and use which explains their ubiquity.  Pairwise constraints can be _combined_ to produce complex behavior without creating complex formulations. Unary constraints are even easier but provide less flexibility when it comes to simulation effects.

Constraints must be _solved_ to enforce their properties and this can be done on 3 different levels: acceleration, velocity, and position.  Each have their pros and cons, but velocity constraints are typically more stable, easier to construct and are easier to solve.  That said, solving on _multiple_ levels has its advantages as well.  A great example is that of acceleration and velocity constraints - while we can solve these constraints exactly, the nature of finite precision, discrete timesteps, and non-global solvers will always introduce drift - the effect of the constraint slowly being violated.  We can use furter solve the position constraints after solving the velocity constraints to prevent drift.

What follows is a framework for building a set of pairwise velocity constraints for 2D.  This same framework can be applied to 3D as well.  In subsequent posts, we'll examine a number of common constraints, define their position constriannt and velocity constraint.  They'll be a little heavy on the Vector/Matrix algrebra side, but a few tricks come up which are really important to reducing down the formulations.

## Position Constraint, Velocity Constraint, and the Jacobian

Let's first start with our simple formulation of a position constraint:

$$
C(x(t),y(t),\theta(t)) = C(\vec{q}(t))
$$

Where $$ x(t), y(t), \theta(t) $$ are the functions that define the translation along the x and y axes and the rotation within the x-y plane respectively. We simplify a bit by grouping these states into a vector $$ \vec{q}(t) $$. Next, our goal is to find the velocity constraint for the position constraint. To get the velocity constraint we need to take the derivative with respect to time of the position constraint. However, recall that our constraint function $$ C $$ is a vector valued function which [requires us to apply the multivariable chain rule](https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/differentiating-vector-valued-functions/a/multivariable-chain-rule-simple-version).  This gives us the following:

$$
\begin{align}
\frac{d}{dt}C(\vec{q}(t)) &= J\frac{d}{dt}\vec{q}(t) \\
&= J\vec{v}
\end{align}
$$

Where $$ \vec{v} $$ is a column vector containing both the linear and angular velocities and $$ J $$ is the [Jacobian Matrix](https://en.wikipedia.org/wiki/Jacobian_matrix_and_determinant#Jacobian_matrix).  We know that for the position constraint to be satisfied $$ C = 0 $$ and the same applies for our velocity constraint:

$$
\begin{equation}
\frac{d}{dt}C = J\vec{v} = 0
\tag{1}
\end{equation}
$$

## Velocity Evolution
What might not be apparent still is how this applies to keeping the constraint enforced.  The key here is understanding the evolution of a body's velocity over time:

$$
\vec{v_f} = \vec{v_i} + \Delta t (\vec{a})
$$

Also recall Netwon's second law and solve for $$ \vec{a} $$

$$
\begin{align}
\sum \vec{f} &= M\vec{a} \\
M\vec{a} &= \sum \vec{f} \\
\vec{a} &= M^{-1}(\vec{f}_{ext} + \vec{f}_c)
\end{align}
$$

> A key concept here is the split of the total force into external forces $$ f_{ext} $$ and constraint forces $$ f_c $$.  In the next step this allows us to remove the external forces from the equation leaving only the the constraint forces.  We can do this by integrating them before we start solving the velocity constraints by numerically evaluating them via an ODE and assigning the result to $$ \vec{v_i} $$ i.e. $$ \vec{v_i} = \vec{v_i} + \Delta t M^{-1}\vec{f}_{ext} $$.

Now if we combine these two equations:

$$
\begin{align}
\vec{v_f} &= \vec{v_i} + \Delta t M^{-1}(\vec{f}_{ext} + \vec{f}_c) \\
&= \vec{v_i} + \Delta t M^{-1}\vec{f}_c
\end{align}
$$

## The Constraint Force
At this point, we have a general equation for getting the new velocity of a body given it's initial velocity, the sum of constraint forces, and the elapsed time.  The next key step is to combine our equation (1) from above with this equation.  But to do so we need to define $$ \vec{f}_c $$ as the magnitude of the force $$ \vec{\lambda} $$ times the direction of the force $$ J^T $$.

$$
\vec{f}_c = J^T\vec{\lambda}_f
$$

> See [here](https://physics.stackexchange.com/a/47962), [here](http://www.cs.cmu.edu/~baraff/sigcourse/notesf.pdf) page 7, and [here](https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc09/slides/04-GDC09_Catto_Erin_Solver.pdf) slide 15 for the best description of this.

If we substitute this equation into our last equation we get:

$$
\begin{align}
\vec{v_f} &= \vec{v_i} + \Delta t M^{-1}\vec{f}_c \\
&= \vec{v_i} + M^{-1}J^T(\Delta t \vec{\lambda}_f) \\
&= \vec{v_i} + M^{-1}J^T\vec{\lambda}_{imp} \tag{2}
\end{align}
$$

> Note that $$ \Delta t $$ is a scalar and can be moved around.  Also note that $$ \vec{\lambda}_f $$ is the magnitude of the force and $$ \Delta t\vec{\lambda}_f $$ is the magnitude of the impulse $$ \vec{\lambda}_{imp} $$.  This is how at the velocity level we deal with impulses.

## Solving for the Impulse $$ \vec{\lambda}_{imp} $$
Finally, we have what we need to solve the constraint by substituting the above equation for $$ \vec{v} $$ in equation (1):

$$
\begin{align}
J\vec{v} &= 0 \\
J(\vec{v_i} + M^{-1}J^T\vec{\lambda}_{imp}) &= 0 \\
J\vec{v_i} + JM^{-1}J^T\vec{\lambda}_{imp} &= 0 \\
JM^{-1}J^T\vec{\lambda}_{imp} &= -J\vec{v_i} \tag{3}
\end{align}
$$

It may not look like much, but this is exactly what we need to solve the constraint now.  It's now in the [general form](https://en.wikipedia.org/wiki/System_of_linear_equations#Matrix_equation) for solving a system of linear equations $$ A\vec{x} = \vec{b} $$ where:

$$
\begin{align}
A &= JM^{-1}J^T \\
\vec{x} &= \vec{\lambda}_{imp} \\
\vec{b} &= -J\vec{v_i}
\end{align}
$$

This will solve the constraints exactly, however, given that the integrator is only an approximation of the ODE and the lack of infinite precision, the constraint will drift as mentioned in the beginning. For example, a point-to-point constraint (simulates a revolute joint) will drift, where the local points of the world space anchor point slowly separate over time.

Drift can be solve using methods like Baumgarte stabilization, post/pre stabilizations methods, etc. which is best left for another post.

> You can solve the system of equations using a general linear equation solver or via matrix multiplication $$ \vec{x} = A^{-1}\vec{b} $$

After solving for $$ \vec{\lambda}_{imp} $$, we can substitute it back into equation 2 to get the final velocities.

## Final Comments
What we've done is built a foundation for solving a general set of constraints (equation 3).  This general formulation requires the definition of the velocities, masses, and the Jacobian.  With this new found ability, the next few posts will focus on describing the position constraints for fundamental constraint types, performing the derivative, isolating the velocities, and identifying the Jacobian by inspection.  Then, we'll take the masses and Jacobian and build the $$ A $$ matrix and $$ \vec{b} $$ vector so we can solve for the impulse $$ \vec{\lambda}_{imp} $$.  And finally, after solving for the impulse we'll use it to compute the new velocities.

The next few posts will focus on pairwise constraints in 2D.  Each constraint's Jacobian will be different, but we can get a little head start by defining the mass and velocity vector which will be the same for every constraint:

$$
\begin{align}
M^{-1} &= \begin{bmatrix} 
M_a^{-1} & 0 & 0 & 0 \\
0 & I_a^{-1} & 0 & 0 \\
0 & 0 & M_b^{-1} & 0 \\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix} \\
\vec{v}_i &= \begin{bmatrix}
\vec{v_a} \\
w_a \\
\vec{v_b} \\
w_b
\end{bmatrix}
\end{align}
$$

> Note that in 2D the angular velocity $$ w $$ is a scalar.

> These are denoted this way because they represent the mass and velocity of the **system**.

A final note on solving the system of equations.  In 2D there will be a maximum of 3x3 system to solve (though this could depend on how you solve other constraints like limits) if you solve each constraint individually.  The formulation above _could_ be used to solve the entire system of all constraints for all bodies, but the challenge is the size of the resulting $$ A $$ matrix and computing it's inverse (or solving for it - these concepts are the same).  Instead, for [dyn4j](http://www.dyn4j.org), we solve each constraint by itself _sequentially_.  This can have the effect of invalidating a constraint after another one has been solved and so we do this same sequential solve process N times to reach a global solution.  The trick to make this work is to clamp the total impulse, not the incremental impulse.  This process ends up begin equivalent to solving the global solution (with enough iterations) but with the added benefits of a simpler and performance-accuracy trade off configuration (the number of iterations).  