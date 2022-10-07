<script>
    import Subtitle from './components/Subtitle.svelte';
    import Project from './components/Project.svelte';

    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/coding.svg';
    import Aguacatitos from './assets/agucatitos.png';
    import Foxes from './assets/foxes.png';
    import Weather from './assets/weather.png';
    import DrMock from './assets/drmock.png';
    import FunctionalProgramming from './assets/fpl.png';
    import WordCloud from './assets/wordcloud.png';

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
        {
            name: 'Dr. Mock Interview',
            url: 'https://daniel692a.github.io/RoboHacksdemo/',
            thumbnail: DrMock,
            altThumbnail: 'Dr. Mock thumbnail project',
        },
        {
            name: 'Programación Funcional',
            url: 'https://mlsa-latam.github.io/programacion-funcional/',
            thumbnail: FunctionalProgramming,
            altThumbnail: 'Programación Funcional thumbnail project',
        },
        {
            name:'Summarize Cloud',
            url: 'https://share.streamlit.io/daniel692a/shentiment/main/main.py',
            thumbnail: WordCloud,
            altThumbnail: 'Summarize Cloud thumbnail project',
        }
    ];
</script>

<section id='projects'>
    <Subtitle content="Projects" />
    <Reveal reveal='fadeInRight' duration='1'>
        <section class="container-projects">
            <section class="cards">
                {#each projects as project}
                    <Project
                        name={project.name}
                        url={project.url}
                        thumbnail={project.thumbnail}
                        altThumbnail={project.altThumbnail}
                    />
                {/each}
            </section>
            <figure class="code-pic">
                <img src="{Coding}" alt="Boy showing code">
            </figure>
        </section>
    </Reveal>
</section>

<style>
    #projects {
        padding: 3rem 0;
        background: rgb(52,11,89);
        background: linear-gradient(180deg, rgba(52,11,89,1) 0%, rgba(34,34,34,1) 100%);
        width: 100%;
        font-family: 'Ubuntu', sans-serif;
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