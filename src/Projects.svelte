<script>
    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/coding.svg';
    import Aguacatitos from './assets/agucatitos.png';
    import Foxes from './assets/foxes.png';
    import Weather from './assets/weather.png';
    import Project from './components/Project.svelte';

    const projects = [
        {
            name: 'Avocados',
            url: 'https://daniel692a.github.io/workshop1-DOM/',
            thumbnail: Aguacatitos,
            altThumbnail: 'Aguacatitos thumbnail project',
        },
        {
            name: 'Random Foxes images',
            url: 'https://daniel692a.github.io/lazy-loading/',
            thumbnail: Foxes,
            altThumbnail: 'Foxes thumbnail project',
        },
        {
            name: 'Weather App',
            url: 'https://daniel692a.github.io/weather-app/',
            thumbnail: Weather,
            altThumbnail: 'Weather thumbnail project',
        },
    ];
</script>

<section id='projects'>
    <h2>Projects</h2>
    <Reveal reveal='fadeInRight' duration='1'>
        <section class="container-projects">
            <section class="cards">
                <Project name={projects[0].name} url = {projects[0].url} thumbnail={Aguacatitos} />
            </section>
            <figure class="code-pic">
                <img src="{Coding}" alt="Boy showing code">
            </figure>
        </section>
    </Reveal>
</section>

<style>
    #projects {
        background-color: #133b5c;
        width: 100%;
        font-family: 'Ubuntu', sans-serif;
    }
    #projects h2 {
        text-align: center;
        font-size: 4.5rem;
        padding-top: 5rem;
        color: #efefef;
    }
    .container-projects {
        margin-top: 3rem;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        align-items: center;
    }
    .code-pic{
        width: 50rem;
    }
    .code-pic img {
        width: 100%;
        height: 100%;
    }
    .cards {
        width: 70rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        height: auto;
    }
    @media (max-width: 950px){
        .code-pic {
            width: 30rem;
        }
    }
</style>