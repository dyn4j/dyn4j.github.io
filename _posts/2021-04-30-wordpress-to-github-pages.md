---
id: 975
title: WordPress to GitHub Pages
date: 2021-04-30 00:36:59 -0500
author: William Bittle
layout: post
permalink: /2021/04/wordpress-to-github-pages/
image: /assets/posts/2021-04-30-wordpress-to-github-pages/jekyll.png
categories:
  - News
  - Blog
tags:
  - dyn4j
---

In my last post where I talked about the reasons for moving the dyn4j site to GitHub Pages and off of WordPress, I mentioned another post to describe the technical details of the move - this is it!  Seriously though, it wasn't trivial, but that's in part due to some self-imposed (inflicted?) constraints.  

{% include figure.html name="wordpress.png" caption="WordPress" credit="https://wordpress.org/" %}

To start, I wanted the site to be something like what I had before - I liked the layout of the landing page and blog portion of the site.  If you were less concerned about what the site looked like you could install an off-the-shelf layout/theme.  GitHub Pages actually has a few to choose from to give you a kickstart.  I also wanted it to be fast and low maintenance which meant using CDNs for any linked libraries, the number of linked libraries should be low, and use of liquid templates to compartmentalize components for reuse.  Probably not surprising, as the move progressed I found issues, enforced new constraints, and had to learn a lot.

Full disclosure - I've been a web developer for 15 years so a lot of the basic concepts are familiar to me - Jekyll, Ruby, Liquid templates, etc. were all new to me.  I was already familiar with markdown as well.

> The dyn4j.org website is a [public repo](https://github.com/dyn4j/dyn4j.github.io) on GitHub.  Reference the source for an additional resource when going through your conversion.

## Getting Started
To get started you'll need to [install the jekyll tooling](https://jekyllrb.com/docs/) which includes ruby.  For development of the site I went with Visual Studio Code which has good support for markdown, yml, css, sass, JavaScript, and so on.  I ended up using all of these in some way and having syntax highlighting was really important.

{% include figure.html name="jekyll.png" caption="Jekyll" credit="https://jekyllrb.com/" %}

After that I went through the [step by step tutorial](https://jekyllrb.com/docs/step-by-step/01-setup/) to get a better understanding of the platform.  I'll confess, I didn't go through all of it right away, I focused mostly on the inital build of the site, index.html, includes, layouts, and front matter.

> The key with Jekyll and GitHub pages is that it's a framework for building static web sites.  You build out your content, pages, JavaScript, etc. and Jekyll combines everything to make static html pages.  This is what makes Jekyll sites really fast.

I also followed the [GitHub guides](https://docs.github.com/en/pages) to get a repo setup properly and cloned it locally.

> Refer to the GitHub Page documentation to understand what things are not supported. For example, not all Jekyll plugins are supported.

## Build the Skeleton
My first goal was to build the basic skeleton of the site and the landing page.  I wanted to choose an existing template, but they all seemed OK - nothing really wrong with them, just not what I wanted so I decided to download a few example jekyll themes: ([no-style-please](http://jekyllthemes.org/themes/no-style-please/) and [creative theme](http://jekyllthemes.org/themes/creative-theme/)) as references.  I also decided on [Bootstrap 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/) for the basic UI components and then set after it.

{% include figure.html name="bootstrap.png" caption="Bootstrap 5" credit="https://getbootstrap.com/" %}

This stage quickly devolved into fixing all the things I didn't like about the old site and feverishly testing on all different screen sizes.  I spent a lot of time here.  I cleaned up verbiage, images, links, pretty much everything.  I'm happy I spent the time there, but it was a huge time suck.

For the animation I used [AOS](https://michalsnik.github.io/aos/) since it had the capability to wait for the user to scroll before animating.  I also included the [MathJax](http://docs.mathjax.org/en/latest/index.html) library since I have a few blog posts that are math heavy.

So at this point I had the landing page done and a decent pattern to follow for the rest of the site.

## Build the Blog
The next step was to get the blog portion of the site going. For that I referenced the no-style-please theme to understand how to display them, where to put the posts, and so on.  I made it my own and modeled it after the existing site with a [tag cloud](https://superdevresources.com/tag-cloud-jekyll/), [grouped by year](https://stackoverflow.com/questions/24191711/archive-jekyll-posts-by-year), and [category links](https://gist.github.com/Phlow/a0e3fa686eb259fe7f76) sections.  There are some limitations here that I didn't really like, but it was a small price to pay.  For example, to create a link to a specific tag or category - not possible - instead you can create a page with _all_ your posts grouped by tag/category and link to that page with an anchor to the correct location on the page.  Not huge deal - no one reads these anyway do they?  The other thing that wasn't straight forward was the [paging](https://jekyllrb.com/docs/pagination/) for the main blog landing page - I didn't want a hundred blog posts to all be on the same page that the user lands on. 

I built it out while using the same posts from the no-style-please theme first to get all the includes and layouts the way I wanted them.

{% include figure.html name="tagcloud.png" caption="Tag Cloud Example" %}

## Moving the Blog Posts
For this step, I needed something to export all the posts from the WordPress site and convert them to Jekyll markdown.  For that I installed the [Jekyll Exporter](https://wordpress.org/plugins/jekyll-exporter/) plugin into my WordPress site.  A couple of good things about this is that it also exported pages and assets (images).  The conversion was pretty good too.  

That said there were some problems.  The first was the `date` front matter data point.  It was in the format ISO format that you'd expect, but Jekyll needs the date formatted like [YYYY-MM-DD HH:MM:SS +/-TTTT](https://jekyllrb.com/docs/front-matter/#predefined-variables-for-posts).  This only matters if you want your posts sorted properly... (lot's of eyerolling ensued). The second problem was that the exported/converted posts left a lot of HTML in them and I really wanted to move to entirely markdown.  I understand why it couldn't convert those parts, they were complex HTML code, so I decided to roll my sleeves up and update all the posts.  This was very time consuming and I was very VERY bored.  I decided while I was modifying each post to review them as well.  This, while still boring, was very satisfying.  For example, going back through the constrained dynamics posts, I found a number of minor mistakes and added more clarifying content.  I also decided to change all the hard coded images of math to Latex for better maintainability.  Another issue was that the exported content didn't properly change the path to images and those needed to be updated and migrated to the site's assets folder manually.  There are [couple of things you can do here](https://stackoverflow.com/questions/19331362/using-an-image-caption-in-markdown-jekyll) to make it easier to references images.  I also reviewed all links and cleaned those up.

> **TIP**: The date format from the Jekyll Exporter does not match what [Jekyll is looking for](https://jekyllrb.com/docs/front-matter/#predefined-variables-for-posts).  That said, as far as I can tell, GitHub Pages doesn't care what I put in for the timezone offset - it just completely ignores it and considers the datetime is in UTC...

All in all, I spent WAY too much time here.  I'm happy with the end result, but can't imagine what I would have done if I had more than 60 posts (and most of my posts were short announcements for dyn4j releases - fixing the larger posts was brutal).

> **TIP**: There's a gotcha here.  The Jekyll Exporter tool exports your posts as markdown files with front matter.  as part of the front matter there's an `id` field which I'm assuming was the original id from WordPress.  However, when you try to do `post.id` you will get the slugified name of the post - the `id` property of the post object cannot be overridden.

## Moving the Comments
I spent a lot of time thinking about whether to move comments or not.  GitHub Pages, being a static site host, meant that I wouldn't be able to accept _more_ comments unless I developed a different solution.  I had around 500 comments total - all moderated so they were quality.  I decided to move them over and make the decision whether to accept new comments later.  Jekyll has a way to generate static content from [data](https://jekyllrb.com/docs/datafiles/).  This is the mechanism we'll use for comments.

> To save you some time, I probably went the long way.  What I describe below is what I did.  After all that work I found [this](https://damieng.com/blog/2018/05/28/wordpress-to-jekyll-comments#exporting-comments-from-wordpress).  Somehow I overlooked this, so I don't know what the output is like, but I'd probably start with that tool  if I were to do it over again.

Moving the comments was a lot harder.  There wasn't a nice exporter like there was for posts so I decided to just export them myself using the WordPress APIs.  To do so, I signed into WordPress admin and executed the following script(s):

```javascript
let promises = [];

promises.push(fetch('/wp-json/wp/v2/posts?per_page=100&page=1').then(function(response){
    return response.json().then(function(data) {
        return data.map(function(item) {
            return {
                id: item.id,
                guid: item.guid
            };
        });
    });
}));

for (var i = 1; i < 7; i++) {
    promises.push(fetch('/wp-json/wp/v2/comments?per_page=100&page=' + i).then(function(response) {
        return response.json().then(function(data) {
            return data.map(function(e) {
                return {
                    id: e.id,
                    post: e.post,
                    parent: e.parent,
                    date: e.date_gmt,
                    content: e.content.rendered,
                    author: e.author_name,
                    avatars: e.author_avatar_urls
                };
            });
        });
    }));
}

Promise.all(promises).then(function (dataSets) {
    let posts = dataSets[0];
    var postsById = {};
    for (var i = 0; i < posts.length; i++) {
        postsById[posts[i].id] = posts[i].guid.rendered;
    }

    let n = dataSets.length;
    let result = [];
    for (var i = 1; i < n; i++) {
        result = result.concat(dataSets[i].map(function(item) {
            item.post_guid = postsById[item.post];
            return item;
        }));
    }
    console.log(JSON.stringify(result));
});
```

> The WordPress APIs have a limit of 100 records per page.

You'll need to tweak it for your scenario.  For example, I knew how many posts and comments I had so I just hard coded the number of API calls I needed to execute.  The script generated a nice JSON string in the console which I just copied and pasted into a file.

> Not shown here, I also exported all posts to JSON in the same way for the next step.

Jekyll acutally supports a few different formats for "data".  One of which is JSON and at first I used the JSON generated in the previous step to feed the posts with the appropriate comments (by filtering them on the post_guid property).  But after making the decision to implement a solution for new comments, I decided to change how I was storing the comments.  I took this JSON file, read it into memory with a C# console application and converted it into a list of yml files, placed in folders named with the slugified name of the parent post (more on the why later).  Here's the code for that:

```csharp
class Program
{
    static void Main(string[] args)
    {
        string json = File.ReadAllText($"posts.json");
        List<Post> posts = JsonConvert.DeserializeObject<List<Post>>(json);
        Dictionary<int, Post> postMap = posts.ToDictionary(p => p.Id);

        json = File.ReadAllText($"comments.json");
        List<Comment> comments = JsonConvert.DeserializeObject<List<Comment>>(cj);

        var converter = new ReverseMarkdown.Converter();
        string baseDir = Directory.GetCurrentDirectory();

        foreach (Comment comment in comments)
        {
            Post post = postMap[comment.Post];
            string path = Path.Combine(baseDir, post.Slug);
            Directory.CreateDirectory(path);

            string avatarUrl = comment.Avatars.OrderBy(a => a.Key).LastOrDefault(a => !string.IsNullOrEmpty(a.Value)).Value;
            string avatarProp = "";
            if (!string.IsNullOrEmpty(avatarUrl))
            {
                avatarProp = $"\navatar: {avatarUrl}";
            }

            // my wordpress content had all kinds of unicode characters I wanted to remove
            string message = comment.Content.Trim()
                .Replace("&#8220;", "\"")
                .Replace("&#8221;", "\"")
                .Replace("&#8217;", "'")
                .Replace("&#8230;", "...")
                .Replace("&#8211;", "-")
                .Replace("\\*", "*")
                .Replace("\"", "\\\"")
                .Replace("“", "'")
                .Replace("”", "'")
                .Replace("&gt;", ">")
                .Replace("&lt;", "<")
                .Replace("\n", "\\n");

            // match the date format Jekyll wants
            string date = comment.Date.ToString("yyyy-MM-dd HH:mm:ss zz00");

            string content = $"id: {comment.Id}\ndate: {date}\nauthor: {comment.Author}\nparent: {post.Slug}{avatarProp}\nmessage: \"{message}\"";
            File.WriteAllText(Path.Combine(path, $"{comment.Id}.yml"), content);
        }
    }
}
```

I then copied+pasted the folders/files to the `data/comments` folder in my Jekyll site and updated my templates, includes, layouts to use these.  I based my templates off of [these](https://github.com/damieng/jekyll-blog-comments/tree/master/jekyll/_includes).  The import of these had some problems - Jekyll warned about a couple of things and I just manually fixed those.

One interesting thing here is that I wanted to convert these to markdown too.  I tried to use the [ReverseMarkdown](https://github.com/mysticmind/reversemarkdown-net) NuGet package, but the generated markdown didn't render properly, so I just left the comments as is.

I also considered going through all the comments and fixing links, images, formatting, etc. and quickly gave up on that idea.  The output was good enough so I just let it all as is - there are just too many to go through.

## Moving any Pages
In WordPress you can create pages as well as posts/comments.  In dyn4j, there were only a few and these were converted via the Jekyll Exporter tool mentioned earlier, but just like posts, they still had a lot of HTML embeded in them.  Another issue is that they were horribly out of date.  So I decided to build these mostly from the ground up.  I used the existing pages for a good outline for content, but pretty much rewrote all of them in markdown.  I think the result is so much better - up to date documentation, more code samples, better references to classes in the library and so on.  I was also able to consolidate some pages and skip the conversion entirely.  I converted 4 pages of 5.

## Code Highlighting
One thing I spent a lot of time on was code highlighting. It was very hard to understand how this works.  Basically, you write your code comments in single or triple tick marks and Jekyll parses the content and emits HTML _ready_ for highlighting (using Rouge).  But to actually highlight the code you must add in a CSS file.  You can find a bunch of options.  [The process is described in detail here](https://bnhr.xyz/2017/03/25/add-syntax-highlighting-to-your-jekyll-site-with-rouge.html#create-a-css-file-for-the-highlighting-style-you-want), but the key that I kept missing was that you run a command to generate the CSS of choice, then you just include that in your `<head>`.

## Custom Domain
No what's really cool about all this is that you can configure GitHub Pages with a custom domain.  You can even enable HTTPS!  I decided at the start of this process that I would do this, but it turned out to be really frustrating for a number of reasons.  The first reason is due to the way DNS works - you change something and everything is broken for a while (a hour for example) until the change propagates.  I think in total dyn4j.org was probably down for 10 hours while I fiddled with this.  The second reason was due to my host through which I purchased the domain long ago - their tools are just so buggy.  Pages not loading, not allowing me to do things but not telling me why, etc.  A lot of this was trial and error.

I just realized I went on a rant and you don't care - you just want to know what to do.  The first thing you should do is read the [official GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) and follow that.  It really is good documentation.

The first step is to configure your GitHub repo with the custom domain name.  It won't work, but that's ok.  You need to do this first so that another repo doesn't steal your domain when you finally point your domain at GitHub IPs.  Once that's complete, then you need to log into the host for your domain and update DNS.  I followed exactly what was in the GitHub Pages documentation and it _nearly_ worked.  For my host, I had to create `A` records ([step 7 of the official docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)) but I also had to create `A` records using "@" as the source.  I also had to use the apex domain in GitHub pages, NOT the `www` prefixed domain.

> **TIP**: If you want both the apex domain and `www` subdomain to work with HTTPS, set the repo custom domain to the apex domain.  For example, if you own `example.com`, set the repo's custom domain to `example.com`.  Then setup the `CNAME` and `A` records as defined in the docs.

> **TIP**: Every host may have different ways to setup DNS.  In my case I had to add 4 more `A` records using "@" instead of my apex domain pointing to GitHub IPs.

> **TIP**: Be patient and expect your site to be down for a while.  DNS takes time to propagate and you want to make sure you are testing accurately.  After making changes in DNS, give it at least an hour (that was the default TTL on my host).

> See [here](https://github.community/t/does-github-pages-support-https-for-www-and-subdomains/10360/75) for more help with custom domain setup.

This was the final setup (not sure if I needed both the @ and dyn4j.org `A` records, but I was pretty frustrated at this point and decided to leave it alone since it was working)

| Type  | Source | Destination |
|-------|--------|---------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| A | dyn4j.org | 185.199.108.153 |
| A | dyn4j.org | 185.199.109.153 |
| A | dyn4j.org | 185.199.110.153 |
| A | dyn4j.org | 185.199.111.153 |
| CNAME | www | dyn4j.github.io |
{: .table}

## Accepting New Comments
Like I've mentioned before, the whole point of Jekyll is to produce a lightning fast static site generated from non-static data (like posts, comments, pages, templates, etc.)  So how can we accept new comments?  It was a great question and I found a [solution](https://haacked.com/archive/2018/06/24/comments-for-jekyll-blogs/).  It's actually quite straight forward:

* Create a comment form that will post data to an Azure Function
* Setup an Azure account ($200 free credit)
* Create an Azure Function to accept comments
* Add the necessary code to the function to create a branch on your site repo, create a comment yml file, and submit a pull request

{% include figure.html name="azure.png" caption="Azure" credit="https://azure.microsoft.com/" %}

You may recall from above that I left the "why" out when I was discussing moving away from a giant JSON file for comments - this is it.  If you have a giant JSON file all PRs will modify that file and merging could become really troublesome.  Instead, if you break out each comment into it's own file, then each comment is independent and you can approve PRs in any order without conflicts.

It's by no means a perfect solution, but it actually turns out to be really nice.  A commenter submits the form, you get it in PR form where you can modify it if needed, you can use the PR as a moderation avenue (be sure to manually delete the source branch).  When you approve the PR and it get's merged, GitHub automatically regenerates your site and deploys it and the comment is now visible!  Cool!

> **TIP**: There's a nice cost calculator for Azure you can use to project cost.  For something like dyn4j.org I calculated the cost at less than $1/month and probably $0 for most months.

Here's the function code, adapted from the link above for .NET Core 3.1:

```csharp
public static class JekyllBlogCommentsAzureFunction
{
    struct MissingRequiredValue { } // Placeholder for missing required form values
    static readonly Regex validPathChars = new Regex(@"[^a-zA-Z0-9-]"); // Valid characters when mapping from the blog post slug to a file path
    static readonly Regex validEmail = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$"); // Simplest form of email validation

    [FunctionName("PostComment")]
    public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestMessage request, ILogger logger, ExecutionContext context)
    {
        var form = await request.Content.ReadAsFormDataAsync();

        // Make sure the site posting the comment is the correct site.
        var commentSite = Environment.GetEnvironmentVariable("CommentWebsiteUrl");
        if (!string.IsNullOrEmpty(commentSite) && !AreSameSites(commentSite, form["comment-site"]))
        {
            logger.LogInformation($"{commentSite} and {form["comment-site"]} do not match");
            return request.CreateErrorResponse(HttpStatusCode.BadRequest, "Please make sure you post this to your own Jekyll comments receiever.");
        }

        if (TryCreateCommentFromForm(form, out var comment, out var errors))
            await CreateCommentAsPullRequest(comment);

        if (errors.Any())
            return request.CreateErrorResponse(HttpStatusCode.BadRequest, String.Join("\n", errors));

        if (!Uri.TryCreate(form["redirect"], UriKind.Absolute, out var redirectUri))
            return request.CreateResponse(HttpStatusCode.OK);

        var response = request.CreateResponse(HttpStatusCode.Redirect);
        response.Headers.Location = redirectUri;
        return response;
    }

    private static bool AreSameSites(string commentSite, string postedCommentSite)
    {
        return Uri.TryCreate(commentSite, UriKind.Absolute, out var commentSiteUri)
            && Uri.TryCreate(postedCommentSite, UriKind.Absolute, out var postedCommentSiteUri)
            && commentSiteUri.Host.Equals(postedCommentSiteUri.Host, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<PullRequest> CreateCommentAsPullRequest(Comment comment)
    {
        // Create the Octokit client
        var github = new GitHubClient(new ProductHeaderValue("PostCommentToPullRequest"),
            new Octokit.Internal.InMemoryCredentialStore(new Credentials(Environment.GetEnvironmentVariable("GitHubToken"))));

        // Get a reference to our GitHub repository
        var repoOwnerName = Environment.GetEnvironmentVariable("PullRequestRepository").Split('/');
        var repo = await github.Repository.Get(repoOwnerName[0], repoOwnerName[1]);

        // Create a new branch from the default branch
        var defaultBranch = await github.Repository.Branch.Get(repo.Id, repo.DefaultBranch);
        var newBranch = await github.Git.Reference.Create(repo.Id, new NewReference($"refs/heads/comment-{comment.id}", defaultBranch.Commit.Sha));

        // Create a new file with the comments in it
        var fileRequest = new CreateFileRequest($"Comment by {comment.author} on {comment.post_id}", new SerializerBuilder().Build().Serialize(comment), newBranch.Ref)
        {
            Committer = new Committer(comment.author, comment.email ?? Environment.GetEnvironmentVariable("CommentFallbackCommitEmail") ?? "redacted@example.com", comment.date)
        };
        await github.Repository.Content.CreateFile(repo.Id, $"_data/comments/{comment.post_id}/{comment.id}.yml", fileRequest);

        // Create a pull request for the new branch and file
        return await github.Repository.PullRequest.Create(repo.Id, new NewPullRequest(fileRequest.Message, newBranch.Ref, defaultBranch.Name)
        {
            Body = $"avatar: <img src=\"{comment.avatar}\" width=\"64\" height=\"64\" />\n\n{comment.message}"
        });
    }

    private static object ConvertParameter(string parameter, Type targetType)
    {
        return String.IsNullOrWhiteSpace(parameter)
            ? null
            : TypeDescriptor.GetConverter(targetType).ConvertFrom(parameter);
    }

    /// <summary>
    /// Try to create a Comment from the form.  Each Comment constructor argument will be name-matched
    /// against values in the form. Each non-optional arguments (those that don't have a default value)
    /// not supplied will cause an error in the list of errors and prevent the Comment from being created.
    /// </summary>
    /// <param name="form">Incoming form submission as a <see cref="NameValueCollection"/>.</param>
    /// <param name="comment">Created <see cref="Comment"/> if no errors occurred.</param>
    /// <param name="errors">A list containing any potential validation errors.</param>
    /// <returns>True if the Comment was able to be created, false if validation errors occurred.</returns>
    private static bool TryCreateCommentFromForm(NameValueCollection form, out Comment comment, out List<string> errors)
    {
        var constructor = typeof(Comment).GetConstructors()[0];
        var values = constructor.GetParameters()
            .ToDictionary(
                p => p.Name,
                p => ConvertParameter(form[p.Name], p.ParameterType) ?? (p.HasDefaultValue ? p.DefaultValue : new MissingRequiredValue())
            );

        errors = values.Where(p => p.Value is MissingRequiredValue).Select(p => $"Form value missing for {p.Key}").ToList();
        if (values["email"] is string s && !validEmail.IsMatch(s))
            errors.Add("email not in correct format");

        comment = errors.Any() ? null : (Comment)constructor.Invoke(values.Values.ToArray());
        return !errors.Any();
    }

    /// <summary>
    /// Represents a Comment to be written to the repository in YML format.
    /// </summary>
    private class Comment
    {
        public Comment(string post_id, string message, string author, string email = null, Uri url = null, string avatar = null)
        {
            this.post_id = validPathChars.Replace(post_id, "-");
            this.message = message;
            this.author = author;
            this.email = email;
            this.url = url;

            date = DateTime.UtcNow;
            id = new { this.post_id, this.author, this.message, this.date }.GetHashCode().ToString("x8");
            if (Uri.TryCreate(avatar, UriKind.Absolute, out Uri avatarUrl))
                this.avatar = avatarUrl;
        }

        [YamlIgnore]
        public string post_id { get; }

        public string id { get; }
        public DateTime date { get; }
        public string author { get; }
        [YamlIgnore]
        public string email { get; }

        [YamlMember(typeof(string))]
        public Uri avatar { get; }

        [YamlMember(typeof(string))]
        public Uri url { get; }

        public string message { get; }
    }
}
```

Now, you do lose spam filtering, but like the source link mentioned, a simple "Are you sure?" dialog seems to do the trick and like previously mentioned you have the moderation via PRs anyway.  I really wanted to put in place some networking restrictions on the Azure side, but you can't.  The comment form is submitted from the client and it goes directly to Azure.

Another cool thing I saw being done on the comment form is the automatic generation of avatar URLs for GitHub, Gravitar, and Twitter.  I'm not sure what their solutions were, but mine was just a [simple (vanilla) JavaScript file](https://github.com/dyn4j/dyn4j.github.io/blob/main/js/comment.js) that takes the username field and generates an avatar URL based on the format.  I'd forgotten how annoying it is to write vanilla JavaScript...

## Summary
While the conversion took more effort than I was expecting, I've very happy with the results.  It actually forced me to go back and revise pages and posts that were in need of some updates.  It also allowes me to maintain the site entirely out of GitHub and drop the hosting I was paying for as well.  Other benefits include speed and full control of the UI.  All this while retaining the capability to blog and receive comments.