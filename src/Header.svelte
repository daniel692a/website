<script>
    // let hamburger, navMenu;
    // hamburger.addEventListener('click', mobileMenu);
    // const mobileMenu = () =>{
    //     hamburger.classList.toggle('active');
    //     navMenu.classList.toggle('active');
    // }
</script>

<header>
    <nav>
        <ul class="nav-menu" >
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <section class="hamburger" >
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
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
        color: #000;
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
        background-color: #000;
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
        background-color: #101010;
    }
    @media (max-width: 500px) {
        ul{
            padding: 0 2rem;
            position: fixed;
            left: -100%;
            flex-direction: column;
        }
        .hamburger{
            display: block;
            cursor: pointer;
        }
        /* .hamburger.active .bar:nth-child(2){
            opacity: 0;
        }
        .hamburger.active .bar:nth-child(1){
            transform: translateY(8px) rotate(45deg);
        }
        .hamburger.active .bar:nth-child(3){
            transform: translateY(-8px) rotate(-45deg);
        } */
    }
</style>