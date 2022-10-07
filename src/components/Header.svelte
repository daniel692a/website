<script>
    import { onMount } from 'svelte'
    let hamburger, navMenu;
    let openMenu = false;
    const closeMenu = () =>{
        openMenu = false;
        mobileMenu();
    }
    onMount(() => {
        const mobileMenu = () =>{
            if(openMenu === false){
                openMenu = true;
            } else {
                openMenu = false;
            }
        }
        hamburger.addEventListener('click', mobileMenu);
    })
</script>

<header>
    <nav>
        <ul class="nav-menu" bind:this={navMenu} class:active={openMenu === true}>
            <li><a href="#about" on:click={closeMenu}>About</a></li>
            <li><a href="#projects" on:click={closeMenu}>Projects</a></li>
            <li><a href="#contact" on:click={closeMenu}>Contact</a></li>
        </ul>
        <section bind:this={hamburger} class="hamburger" aria-label="Menu">
            <span class="bar" class:move1={openMenu === true}></span>
            <span class="bar" class:enable={openMenu === true}></span>
            <span class="bar" class:move2={openMenu === true}></span>
        </section>
    </nav>
</header>

<style>
    header {
        width: 100%;
        height: 10rem;
        font-family: monospace;
        font-size: 2.5rem;
    }
    ul {
        display: flex;
        list-style: none;
    }
    li {
        padding: 2rem 1rem;
        font-weight: 600;
    }
    a {
        text-decoration: none;
        color: #efefef;
        position: relative;
    }
    a::before {
        content: "";
        position: absolute;
        width: 0;
        height: 3px;
        bottom: 0;
        left: 0;
        visibility: hidden;
        background-color: #efefef;
        transition: all 0.3s ease-in-out;
    }
    a:hover::before {
        visibility: visible;
        width: 100%;
    }
    .hamburger{
        display: none;
    }
    .bar{
        display: block;
        width: 25px;
        height: 3px;
        margin: 5px auto;
        -webkit-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
        background-color: #efefef;
    }
    .enable{
        opacity: 0;
    }
    .move1{
        transform: translateY(8px) rotate(45deg);
    }
    .move2{
        transform: translateY(-8px) rotate(-45deg);
    }
    .active{
        left: 0%;
    }
    @media (max-width: 500px) {
        ul{
            padding: 0 2rem;
            position: fixed;
            left: -100%;
            flex-direction: column;
            width: 100%;
            transition: 0.3s;
            background-color: #222222;
            margin: 3.5rem 0 0 0;
            z-index: 3;
        }
        .hamburger{
            width: 100%;
            z-index: 4;
            padding: 1rem 0;
            position: fixed;
            display: block;
            cursor: pointer;
            background-color: #222222;
        }
        .bar{
            margin: 5px 40px;
        }
    }
</style>