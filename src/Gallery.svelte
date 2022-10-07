<script>
    import ESCOM from './assets/gallery/ESCOM.jpg';
    import ESCOM_1 from './assets/gallery/ESCOM-1.jpg';
    import ESCOM_2 from './assets/gallery/ESCOM-2.jpg';
    import ESCOM_3 from './assets/gallery/ESCOM-3.jpg';
    import ESCOM_4 from './assets/gallery/ESCOM-4.jpg';
    import ESCOM_5 from './assets/gallery/ESCOM-5.jpg';
    import ESCOM_6 from './assets/gallery/ESCOM-6.jpg';
    import FRIENDS from './assets/gallery/FRIENDS.jpg';
    import PLATZI_1 from './assets/gallery/PLATZI-1.jpg';
    import PLATZI from './assets/gallery/PLATZI.jpg';
    import PLATZI_2 from './assets/gallery/PLATZI-2.jpg';
    import MLSA from './assets/gallery/MLSA.png';
    import MLSA_1 from './assets/gallery/MLSA-1.jpg';
    import MLSA_2 from './assets/gallery/MLSA-2.jpg';
    import STEM from './assets/gallery/STEM.png';

	import { reveal } from 'svelte-reveal';

</script>

<section>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={PLATZI_1} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <h1>Making</h1>
        <img src={ESCOM_1} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <h1>an</h1>
        <img src={PLATZI_2} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <img src={ESCOM_2} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={PLATZI} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <h1>Impact</h1>
        <img src={MLSA} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <h1>with</h1>
        <img src={STEM} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={FRIENDS} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <img src={ESCOM_3} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <h1>technology</h1>
        <img src={MLSA_1} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={ESCOM_4} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={MLSA_2} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"slide" }}>
        <img src={ESCOM_5} alt="Platzi event with my firends">
    </figure>
    <figure use:reveal={{ transition:"fly" }}>
        <img src={ESCOM_6} alt="Platzi event with my firends">
    </figure>
</section>

<style>
    h1{
        font-size: 4rem;
        text-align: center;
        background: -webkit-linear-gradient(147deg, #FFE53B 0%, #FF2525 74%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-family: 'Ubuntu', sans-serif;
    }
    section{
        margin-top: 10vh;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        grid-auto-rows: 230px;
        grid-auto-flow: dense;
        grid-gap: 20px;
        margin-bottom: 10vh;
        padding: 1rem;
    }
    section figure{
        position: relative;
        overflow: hidden;
        border-radius: 10px;
    }
    figure img{
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
    section figure:nth-child(1){
        grid-column: span 2;
        grid-row: span 2;
    }
    section figure:nth-child(2){
        grid-column: span 4;
        grid-row: span 2;
    }
    section figure:nth-child(3), section figure:nth-child(10){
        grid-column: span 2;
        grid-row: span 2;
    }
    section figure:nth-child(4), section figure:nth-child(11){
        grid-column: span 2;
        grid-row: span 1.5;
    }
    section figure:nth-child(6), section figure:nth-child(7){
        grid-column: span 3;
        grid-row: span 2;
    }
    section figure:nth-child(11) img{
        object-position: bottom;
    }
    section figure:nth-child(4) img{
        object-position: top;
    }
    section figure:nth-child(6) img{
        object-position: left;
    }
    section figure:nth-child(7) img{
        object-position: bottom;
    }
    @media (max-width: 950px){
        section {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            grid-auto-rows: 230px;
        }
        section figure:nth-child(1), section figure:nth-child(2), section figure:nth-child(3), section figure:nth-child(4), section figure:nth-child(6), section figure:nth-child(7), section figure:nth-child(10), section figure:nth-child(11){
            grid-column: unset;
            grid-row: unset;
        }
    }
</style>