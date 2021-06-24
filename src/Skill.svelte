<script>
    import macBook from './assets/MacBook.png';
    import JavaScript from './assets/javascript.svg';
    import Python from './assets/python.svg';
    import Julia from './assets/julia.svg'
    import Svelte from './assets/svelte.svg';
    import React from './assets/react.svg';
    import Flask from './assets/flask.svg';
</script>

<section class="skillset">
    <figure class="float">
        <img src="{macBook}" alt="MacBook picture">
    </figure>
    <h2>Skillset</h2>
    <section class="tools">
        <h3>Programming Languages:</h3>
        <ul>
            <li><img src="{JavaScript}" alt="JavaScript Icon"><span>JavaScript</span></li>
            <li><img src="{Python}" alt="Python icon"><span>Python</span></li>
            <li><img src="{Julia}" alt="Julia icon"><span>Julia</span></li>
        </ul>
        <h3>Frontend Tools:</h3>
        <ul>
            <li><img src="{Svelte}" alt="Sveltejs icon" title="Sveltejs"><span>SvelteJs</span></li>
            <li><img src="{React}" alt="Reactjs icon" title="ReactJs"><span>ReactJs</span></li>
        </ul>
        <h3>Backend Tools:</h3>
        <ul>
            <li><img src="{Flask}" alt="Flask icon"><span>Flask</span></li>
        </ul>
    </section>
</section>

<style>
    .skillset {
        background-color: #00C89D;
        font-family: 'Ubuntu', sans-serif;
        padding: 3rem 0;
        width: 100%;
        position: relative;
    }
    .skillset h2 {
        text-align: center;
        font-size: 4.5rem;
    }
    .float {
        width: 30rem;
        height: 20rem;
        position: absolute;
        z-index: 2;
        right: 10rem;
        top: 14rem;
    }
    .float img {
        width: 100%;
        height: 100%;
        transform: rotate(0.7turn);
    }
    .tools {
        padding: 3rem 0;
    }
    .tools h3 {
        font-size: 2rem;
        margin: 3rem 0 2rem 5rem;
    }
    .tools ul {
        list-style: none;
        display: flex;
    }
    .tools ul li {
        background-color: #F7F5DD;
        display: flex;
        align-items: center;
        height: 8rem;
        overflow: hidden;
        border-radius: 3rem;
        padding: 1rem 3rem;
        margin: 0 1.5rem;
    }
    .tools ul li img {
        height: 100%;
        margin-right: 1rem;
    }
    .tools ul li span {
        font-size: 1.8rem;
    }
</style>