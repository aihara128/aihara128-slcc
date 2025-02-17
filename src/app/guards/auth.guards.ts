import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';



export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        // ถ้าไม่ได้ล็อกอินให้ redirect ไปหน้า login
        router.navigateByUrl("/");
        return false;
      } else {
        // ถ้าล็อกอินแล้วให้เข้าใช้งานได้
        return true;
      }
    })
  );
  // return true;
};
