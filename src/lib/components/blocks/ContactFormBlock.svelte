<script>
	let {
		inbox_key,
		name_label,
		name_placeholder,
		email_label,
		email_placeholder,
		choices_legend,
		choices,
		checkbox_label,
		submit_label
	} = $props();

	// The Visual Editor preview must not post submissions.
	const blockInEditor = (event) => {
		if (window.inEditorMode) event.preventDefault();
	};
</script>

<!-- CloudCannon hosting delivers POSTed submissions to the Inbox named by inbox_key. -->
<form method="post" onsubmit={blockInEditor}>
	{#if inbox_key}
		<input type="hidden" name="inbox_key" value={inbox_key} />
	{/if}

	<div class="form-section">
		<label for="name" data-editable="text" data-prop="name_label">{name_label}</label>
		<input type="text" id="name" name="name" placeholder={name_placeholder} />
	</div>

	<div class="form-section">
		<label for="email" data-editable="text" data-prop="email_label">{email_label}</label>
		<input type="email" id="email" name="email" placeholder={email_placeholder} />
	</div>

	<fieldset>
		<legend data-editable="text" data-prop="choices_legend">
			{choices_legend}
		</legend>

		<div data-editable="array" data-prop="choices">
			{#each choices ?? [] as choice, i}
				<div data-editable="array-item">
					<input type="radio" name="choice" id="s{i + 1}" value={choice} />
					<label for="s{i + 1}" data-editable="text" data-prop="">{choice}</label>
				</div>
			{/each}
		</div>
	</fieldset>

	<div class="form-section">
		<input type="checkbox" id="c1" name="signup" />
		<label for="c1" data-editable="text" data-prop="checkbox_label">{checkbox_label}</label>
	</div>

	<input type="submit" value={submit_label} />
</form>
