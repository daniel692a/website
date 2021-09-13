<script>
    import Reveal from 'svelte-c-reveal';
    import Coding from './assets/coding.svg';
    import Aguacatitos from './assets/agucatitos.png';
    import Foxes from './assets/foxes.png';
    import Weather from './assets/weather.png'
</script>

<section id='projects'>
    <h2>Projects</h2>
    <Reveal reveal='fadeInRight' duration='1'>
        <section class="container-projects">
            <section class="cards">
                <section class="card">
                    <a href="https://daniel692a.github.io/weather-app/" target="_blank" rel="noopener noreferrer">
                        <figure>
                            <img src="{Weather}" alt="Weather thumbnail project">
                        </figure>
                        <h5>Weather App</h5>
                    </a>
                </section>
                <section class="card">
                    <a href="https://daniel692a.github.io/workshop1-DOM/" target="_blank" rel="noopener noreferrer">
                        <figure>
                            <img src="{Aguacatitos}" alt="Aguacatitos thumbnail project">
                        </figure>
                        <h5>Avocados</h5>
                    </a>
                </section>
                <section class="card">
                    <a href="https://daniel692a.github.io/lazy-loading/" target="_blank" rel="noopener noreferrer">
                        <figure>
                            <img src="{Foxes}" alt="Foxes thumbnail project">
                        </figure>
                        <h5>Random Foxes images</h5>
                    </a>
                </section>
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
    .card {
        width: 20rem;
        background-color: #007696;
        border-radius: 1rem;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease-in;
        margin: 1rem 0;
    }
    .card figure {
        width: 100%;
    }
    .card figure img{
        width: 100%;
    }
    .card h5{
        font-size: 2rem;
        text-align: center;
        padding: 2rem 1rem;
    }
    .card a{
        text-decoration: none;
        color: #F7F5DD;
    }
    .card:hover{
        background-color: #BB006A;
    }
    @media (max-width: 950px){
        .code-pic {
            width: 30rem;
        }
    }
</style>