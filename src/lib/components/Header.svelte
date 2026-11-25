<script>
	import { preventDefault } from 'svelte/legacy';

	import MainNav from './MainNav.svelte'
	import HamburgerMenuButton from './HamburgerMenuButton.svelte'
	import site from '$lib/data/site.json'

	const focusMain = () => {
		const main = document.querySelector('main');
		main.focus();
	}
</script>


<header>
	<a onclick={preventDefault(focusMain)} class="skip-to-content-link" href="#main">
		Skip to main content
	</a>
	
	<a href="/" class="site-title">
		<editable-text data-prop="@data[site].title">{site.title}</editable-text>
	</a>
	
	<HamburgerMenuButton />
	<MainNav />

</header>