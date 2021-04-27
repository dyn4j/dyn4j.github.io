---
id: 974
title: dyn4j.org Moved to GitHub Pages
date: 2021-04-26 00:36:59 -0500
author: William Bittle
layout: post
permalink: /2021/04/dyn4j-org-moved-to-github-pages/
image: /assets/posts/2021-04-26-dyn4j-org-moved-to-github-pages/octojekyll.png
categories:
  - News
  - Blog
tags:
  - dyn4j
---

After a long stint on [WordPress](https://wordpress.org/) I finally was feed up - not with WordPress so much as I explain below.  WordPress has been a great solution for the time I've been using it.  It made things really easy to setup and manage and it's improved significantly over the years.  However, there's always been a few thorns in my side with this solution.

To be clear, with dyn4j.org I was looking for both a nice project website to highlight the maturity that I strive for in library and to serve as a blogging platform for some of the difficult features of the library.

{% include figure.html name="octojekyll.png" caption="GitHub + Jekyll" credit="https://jekyllrb.com/" %}

## Thorn #1: Hosting
Hosting of WordPress should be easy and straight forward.  When I first took the deep dive into the platform, it was.  My host has nice GUI tools to install it and get a domain pointed to it - great!  Overtime, however, is where things went down hill.  

The real nail in the coffin for this move, was more a _host_ problem than a _WordPress_ problem.  They make no attempts to keep you off of aging infrastructure and then charge you to move to equivalent, better supported infrastructure.  In my particular case, I'd just renewed for a few years when I realized that my hosting was on some ancient infrastructure that was stuck on PHP 5.x or something and that I'd have to renew _again_ to move.  What?!  I couldn't believe it.  The whole reason I found out about this was because WordPress was asking me to upgrade, but that upgrade required a newer version of PHP.

Another thing to mention is the ubiquity of more robust solutions and hosting (read: cloud) out there these days.  For example, in my day job I frequently use the Microsoft stack, deploying to [Azure](https://azure.microsoft.com/en-us/) - their tools are really nice to work with.  Want to move to .NET Core 3.1?  No problem, create a new App Service Plan and move everything over - no need to deal with support.

## Thorn #2: Upgrades
It's probably already clear by now, but upgrades were also a nusiance.  Tons of [warnings](https://wordpress.org/support/article/upgrading-wordpress-extended-instructions/) about "Take a backup because everything could be broken after this" never gave me much hope, but generally speaking it worked well.  The issue is that WordPress has moved on past the PHP version supported the infrastructure I was on.  Sticking around on this old infrastructure and old PHP version just gave me the chills.

## Thorn #3: Security
One really strange issue that has occurred, on a number of occasions, has been where someone modified (still not sure how) my [.htaccess files and redirected incoming traffic to _lovely_ pharmaceutical sites](https://www.wordfence.com/learn/removing-malicious-redirects-site/).  As a maintainer, you'd never notice unless you google-searched a page for the site and tried to click the google result - it only redirected in those scenarios.  Needless to say, that was very frustrating and I spent A LOT of time hardening my security setup (changed passwords, added MFA, changed FTP usernames and passwords, etc.).  This isn't how I want to be spending my evenings.

## Thorn #4: SSL
Yet another cost if you host yourself is SSL.  It's not like dyn4j.org needs it for anything (no there aren't any custom made t-shirts or hats for you to buy), but there's been a lot of talk from browsers about showing nasty messages when you navigate to a site without HTTPS.  Paying for this just so a browser doesn't tag my site as a scam, just seemed like an internet tax.

## Thorn #5: Customizability
WordPress is super customizable, has tons of OOB themes, free themes, paid themes, plugins, etc. It really is a nice ecosystem.  But this strength is also a great weakness - I really don't want to spend my precious free time trying to understand the internals of WordPress just so I can customize a page or two.  This made it feel very rigid - you either stuck with the plugins/themes you have installed or you learn WordPress development - and I feel like this made it really stagnant.

## Thorn #6: Performance
This is more a knock on my hosting provider - it just always felt slow for what was really a static site with a few infrequent blog posts.  I was on the basic of basic plans to reduce cost, but even then there really isn't that much going on with this site to warrant the lack of performance.

## Replacement Decision
I just kept asking myself, "Why do I keep paying for (putting up with) this...?"  The only answer I could think of was a lack of time to make the move.  I finally decided, after my hosting provider told me, "You need to pay up if you want new infrastructure" that now was the time to move - even if I my sleep would suffer.  

Research initially focused on a replacement host, but the thought of doing the same thing, just on a different host, made me start searching for alternatives.  It was then that I discovered GitHub Pages, albeit [much later](https://www.smashingmagazine.com/2014/08/build-blog-jekyll-github-pages/) than the rest of the internet it seems...

GitHub Pages offers a really neat way of hosting a site.  You build your site using a public repo and GitHub will use whatever branch you choose to serve it up.  There are two primary offerings, a static site built however you want, and a [Jekyll](https://jekyllrb.com/) based solution.  

The key concern, in either offering, was that the site is effectively static - i.e. no user interaction or other server components would be possible.  Thinking about the dyn4j.org use-case though, the only user-interaction "needed" (though [GitHub Discussions](https://github.com/dyn4j/dyn4j/discussions) might be an interesting alternative) was post commenting.  At first, I considered whether I needed commenting at all, but as a I went through the exercise of designing the new site, I found a really cool [work around](https://haacked.com/archive/2018/06/24/comments-for-jekyll-blogs/).  At this point I was pretty much sold, GitHub Pages would allow me to do what I'm already doing but would solve all of my thorns:

* **Hosting** - GitHub is the host and it's free!  Give some money to a charity or your choosing!
* **Upgrades** - You can build whatever you want and it's all static - you only need to support browser capabilities which have an incredible history of backwards compatibility.
* **Security** - GitHub doesn't host anything, they only host the repo's statically generated content.
* **SSL** - GitHub will issue a cert for you - unbelievable...
* **Customizability** - You can build a site with HTML, CSS, and JavaScript or go down the Jekyll path.  If you've done web development in your career it'll be nothing.  Jekyll did have a bit of a learning curve, but nothing like WordPress.
* **Performance** - GitHub only publishes a static site and it is lightning fast.  I can't even tell you how much more professional a site looks when it's fast.

> There is one caveat here with Upgrades when using Jekyll.  While GitHub pages supports Jekyll natively, it only supports a limited subset of plugins and features.  At the time of this writing I installed the latest version of the tooling and this worked fine, but only time will tell.  You can avoid this risk, compromising some maintainability, by building a static site with just HTML, CSS, and JavaScript.

You can see the end result at [dyn4j.org](https://dyn4j.org/) and it's [accompanying repo](https://github.com/dyn4j/dyn4j.github.io).  I'll do another post on the technical elements of the move and the various issues I ran into.