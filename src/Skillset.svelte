<script>
    import JavaScript from './assets/javascript.svg';
    import Python from './assets/python.svg';
    import Cplusplus from './assets/cplusplus.svg'
    import Svelte from './assets/svelte.svg';
    import React from './assets/react.svg';
    import FastAPI from './assets/fastapi.svg';
    import Flask from './assets/flask.svg';
    import TensorFlow from './assets/tensorflow.svg';
    import Pandas from './assets/pandas.svg';
    import NumPy from './assets/numpy.svg';
    import ScikitLearn from './assets/scikitlearn.svg';
</script>

<section class="skillset">
    <h2>Skillset</h2>
    <section class="tools">
        <h3>Programming Languages:</h3>
        <ul>
            <li><img src="{Python}" alt="Python icon"><span>Python</span></li>
            <li><img src="{Cplusplus}" alt="C++ icon"><span>C++</span></li>
            <li><img src="{JavaScript}" alt="JavaScript Icon"><span>JavaScript</span></li>
        </ul>
        <h3>Frontend Tools:</h3>
        <ul>
            <li><img src="{React}" alt="Reactjs icon" title="ReactJs"><span>ReactJs</span></li>
            <li><img src="{Svelte}" alt="Sveltejs icon" title="Sveltejs"><span>SvelteJs</span></li>
        </ul>
        <h3>Backend Tools:</h3>
        <ul>
            <li><img src="{FastAPI}" alt="FastAPI icon"><span>FastAPI</span></li>
            <li><img src="{Flask}" alt="Flask icon"><span>Flask</span></li>
        </ul>
        <h3>ML Tools:</h3>
        <ul>
            <li><img src="{NumPy}" alt="NumPy icon"><span>NumPy</span></li>
            <li><img src="{Pandas}" alt="Pandas icon"><span>Pandas</span></li>
            <li><img src="{ScikitLearn}" alt="ScikitLearn icon">ScikitLearn</li>
            <li><img src="{TensorFlow}" alt="TensorFlow icon"><span>TensorFlow</span></li>
        </ul>
    </section>
</section>

<style>
    .skillset {
        background-color: rgb(14, 45, 78);
        font-family: 'Ubuntu', sans-serif;
        padding: 3rem 0;
        width: 100%;
        position: relative;
    }
    .skillset h2 {
        padding-top: 2rem;
        text-align: center;
        font-size: 4.5rem;
        color: #efefef;
    }
    .tools {
        padding: 3rem 0;
    }
    .tools h3 {
        font-size: 2rem;
        margin: 3rem 0 2rem 5rem;
        color: #efefef;
    }
    .tools ul {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
    }
    .tools ul li {
        background-color: #F7F5DD;
        display: flex;
        align-items: center;
        height: 8rem;
        overflow: hidden;
        border-radius: 3rem;
        padding: 1rem 3rem;
        margin: 0.8rem 1.5rem;
    }
    .tools ul li img {
        height: 100%;
        margin-right: 1rem;
    }
    .tools ul li span {
        font-size: 1.8rem;
    }
</style>