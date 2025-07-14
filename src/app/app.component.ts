import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import 'swiper/css';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import emailjs from 'emailjs-com';
import { environment } from '../environments/environment';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return {
    getTranslation: (lang: string): Observable<any> =>
      http.get(`./i18n/${lang}.json`),
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  swiperElement = signal<SwiperContainer | null>(null);
  @ViewChild('formElement') formElement!: ElementRef;
  config = {
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    on: {
      init: () => {
        const bullets = document.querySelectorAll('.swiper-pagination-bullet');
        bullets.forEach((bullet: any) => {
          bullet.style.position = 'static';
        });
      },
    },
  };

  translate = inject(TranslateService);
  btnAnterior: any;

  screenWidth: number = window.innerWidth;
  flagWidth: boolean = false;
  flagMenu: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = window.innerWidth;
    this.flagWidth = this.screenWidth <= 560;
    if (!this.flagWidth) this.flagMenu = false;

    this.botonSelect(this.btnAnterior.id);
  }

  btnAnteriorLng: any;

  name: string = '';
  email: string = '';
  title: string = '';
  message: string = '';

  constructor() {
    this.translate.setDefaultLang('es');
    // let window = window.width
  }

  cambiarIdioma(lang: string) {
    this.translate.use(lang);
    const button = document.getElementById(lang);
    if (button) {
      if (button == this.btnAnteriorLng) {
        return;
      }

      button.style.color = '#14AE5C';

      if (this.btnAnteriorLng) {
        this.btnAnteriorLng.style.color = 'aliceblue';
      }

      this.btnAnteriorLng = button;
    }
  }

  ngOnInit(): void {
    const swiperElemConstructor = document.querySelector('swiper-container');
    const swiperOptions: SwiperOptions = {
      slidesPerView: 1,
      pagination: true,
      autoplay: true,
      loop: true,
      breakpoints: {
        300: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        980: { slidesPerView: 3 },
      },
      spaceBetween: 30,
    };
    Object.assign(swiperElemConstructor!, swiperOptions);
    this.swiperElement.set(swiperElemConstructor as SwiperContainer);
    this.swiperElement()?.initialize();

    this.screenWidth = window.innerWidth;
    this.flagWidth = this.screenWidth <= 560;
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            this.botonSelect(`btn-${sectionId}`);
          }
        });
      },
      { threshold: 0.5 }
    );

    document
      .querySelectorAll('div')
      .forEach((section) => observer.observe(section));

    this.btnAnteriorLng = document.getElementById('es');
    if (this.btnAnteriorLng) {
      this.btnAnteriorLng.style.color = '#14AE5C';
    }

    // this.desactivarAnimMenu();
  }

  desactivarAnimMenu() {
    const menu = document.querySelector('.menu');
    if (menu) menu.classList.remove('slide-out-right');

    const menuId = document.getElementById('menu');
    if (menuId) menuId.style.opacity = '0';
  }

  enviarMail() {
    if (this.name && this.email && this.title && this.message) {
      const form = this.formElement.nativeElement;

      emailjs
        .sendForm(
          environment.SERVICE_ID,
          environment.TEMPLATE_ID,
          form,
          environment.USER_ID
        )
        .then((response) => {
          console.log('Correo enviado!', response);
          Swal.fire({
            title: 'Enviado!',
            icon: 'success',
            background: '#1E1E1E',
          });
        })
        .catch((error) => {
          console.error('Error al enviar el correo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo salió mal!',
            background: '#1E1E1E',
          });
        });
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'error',
        title: 'Complete todos los campos!',
        background: '#1E1E1E',
      });
      console.log('Formulario inválido, algunos campos están vacíos');
    }
  }

  GoSection(sectionId: any) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      if (sectionId == 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  botonSelect(idButton: string = '') {
    const button = document.getElementById(idButton);
    if (button) {
      if (button == this.btnAnterior) {
        button.style.color = '#14AE5C';
        return;
      }

      button.style.color = '#14AE5C';
      if (this.btnAnterior) {
        this.btnAnterior.style.color = 'aliceblue';
      }

      this.btnAnterior = button;
    }
  }

  toggleMenu() {
    this.flagMenu = !this.flagMenu;

    if (this.flagMenu) {
      const menu = document.querySelector('.menu');
      if (menu) {
        menu.classList.remove('slide-out-right');
        menu.classList.add('slide-in-right');
      }
    } else {
      const menu = document.querySelector('.menu');
      if (menu) {
        menu.classList.remove('slide-in-right');
        menu.classList.add('slide-out-right');
      }
    }
  }
}
