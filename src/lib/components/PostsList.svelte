<script>
	// `editable` binds each post's fields to its own file; only pages a collection file opens need it.
	let { posts = [], editable = false } = $props();

	const file = (post) => `@file[/src/lib/posts/${post.slug}.md]`;
</script>


<ul class="posts-list">
	{#each posts as post}
		<li>
			<article>
				<a href="/blog/{post.slug}">
					{#if post.coverImage}
						<img
						src={post.coverImage}
						alt=""
						width={post.coverWidth}
						height={post.coverHeight}
						style="ratio: {post.coverWidth} / {post.coverHeight}"
						data-editable={editable ? 'image' : undefined}
						data-prop-src={editable ? `${file(post)}.coverImage` : undefined}
						/>
					{/if}
					<h2
						data-editable={editable ? 'text' : undefined}
						data-prop={editable ? `${file(post)}.title` : undefined}
					>
						{post.title}
					</h2>
				</a>
			</article>

			<p
				data-editable={editable ? 'text' : undefined}
				data-prop={editable ? `${file(post)}.excerpt` : undefined}
			>{post.excerpt}</p>
		</li>
	{/each}
</ul>
