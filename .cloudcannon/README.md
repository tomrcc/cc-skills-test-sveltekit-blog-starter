# Editing this site

A personal blog: a home page, a few standalone pages, and blog posts grouped into categories. Category pages and the blog listing build themselves from the posts.

## Quick links

- [Pages](cloudcannon:collections/pages)
- [Posts](cloudcannon:collections/posts)
- [Data](cloudcannon:collections/data)

## Pages

The home page, About, Contact and the Blog page's heading.

- **Page** — a title and a body of text. Opens in the Visual Editor; you can also use the Content Editor.
- **Page Builder** — a page made of sections you add, remove and drag into order: Rich Text, Callout and Contact Form. The Contact page uses it.
- **Blog Index** — the heading and search description of the Blog page. The list of posts below it fills itself in.

Add a page with **+ Add** and pick **Page** or **Page Builder**. Delete or rename pages from the file list. A new page appears in the menu only once you add it under Data > Navigation.

## Posts

Blog posts, newest first on the Blog page. Each post has a title, published and updated dates, categories, a cover image, a short excerpt, and the body text.

Add a post with **+ Add**. Each category a post uses gets its own page listing its posts.

## Data

Site-wide settings, each in its own file:

- **Site** — the site title in the header, the site description, the live domain and link used in the RSS feed, and the footer credit.
- **Navigation** — the menu links in the header and footer.
- **Footer** — the extra links shown before the menu links in the footer.
- **Categories** — the choices offered for a post's categories. Add a category here before picking it on a post.

## New pages and posts

Until the site rebuilds, a new item previews on an existing page:

- A new **Page** previews on the home page.
- A new **Page Builder** page previews on the Contact page. Deleting or renaming the Contact page leaves new Page Builder pages without a preview.
- A new **post** previews on the post "Automatic heading links in mdsvex". Deleting or renaming that post leaves new posts without a preview.

## Components in text

In post and page bodies, add a **Callout** from the toolbar's snippet button for a highlighted box of text.

## Writing limits

Don't type curly braces `{` or `}` in post or page body text: the page won't build. They're fine inside code.
