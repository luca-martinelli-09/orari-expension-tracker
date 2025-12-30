<script lang="ts">
	import { Upload, Trash2, FileText, Eye } from 'lucide-svelte';
	import Button from './Button.svelte';
	import type { Attachment } from '$lib/types';

	let {
		attachments = $bindable(),
		onFileAdd,
		label = 'Allegati'
	} = $props<{
		attachments: Attachment[];
		onFileAdd: (file: File) => void;
		label?: string;
	}>();

	function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			Array.from(input.files).forEach(onFileAdd);
		}
	}

	function removeAttachment(id: string) {
		attachments = attachments.filter((a: Attachment) => a.id !== id);
	}

	function openPreview(data: string) {
		const w = window.open();
		if (w) {
			w.document.write(
				'<iframe src="' +
					data +
					'" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
			);
		}
	}
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center px-1">
		<span class="text-[10px] font-black uppercase tracking-[0.2em] text-md-onSurface/40"
			>{label}</span
		>
		<label
			for="attachment-upload"
			class="cursor-pointer bg-md-onSurface text-md-surface hover:brightness-110 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
		>
			<div class="flex items-center gap-2">
				<Upload size={14} strokeWidth={3} />
				<span>Carica</span>
			</div>
			<input
				id="attachment-upload"
				type="file"
				multiple
				class="hidden"
				onchange={handleFile}
				accept=".pdf,image/*"
			/>
		</label>
	</div>

	{#if attachments.length > 0}
		<ul class="space-y-2">
			{#each attachments as file}
				<li
					class="flex items-center justify-between border-2 border-md-onSurface p-3 group transition-all bg-md-background"
				>
					<div class="flex items-center gap-3 overflow-hidden">
						<div class="text-md-onSurface">
							<FileText size={18} strokeWidth={2.5} />
						</div>
						<span
							class="truncate max-w-[160px] text-xs font-black uppercase tracking-tight text-md-onSurface"
							>{file.name}</span
						>
					</div>
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							onclick={() => openPreview(file.data)}
							class="!p-2 !border-none text-[10px] font-black uppercase tracking-widest text-md-onSurface/60 hover:text-md-onSurface"
						>
							<Eye size={14} class="mr-1" /> Anteprima
						</Button>
						<Button
							variant="icon"
							onclick={() => removeAttachment(file.id)}
							class="!p-2 hover:text-md-onSurface text-md-onSurface/30 border-none"
						>
							<Trash2 size={18} strokeWidth={2.5} />
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<div
			class="text-[10px] font-black uppercase tracking-[0.2em] text-md-onSurface/20 text-center py-8 border-2 border-dashed border-md-onSurface/10"
		>
			Trascina o incolla file qui
		</div>
	{/if}
</div>
