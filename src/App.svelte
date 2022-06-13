<script lang="ts">
    let x = 'HelloWorld';

    const fn = () => {
        x = 'WorldHello';
    };
</script>

<div on:click={fn}>
    {x}
</div>
