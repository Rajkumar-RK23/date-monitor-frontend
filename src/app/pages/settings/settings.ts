import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  changeForm: FormGroup;
  profileForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);
  passwordStrength = signal(0);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.changeForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatch },
    );

    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      husbandEmail: ['', [Validators.email]],
    });

    // populate profile form from current user
    this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.profileForm.patchValue({
          email: u.email,
          husbandEmail: u.husbandEmail || '',
        });
      }
    });
  }

  passwordMatch(group: FormGroup) {
    const newP = group.get('newPassword')?.value;
    const confirm = group.get('confirmNewPassword')?.value;
    return newP === confirm ? null : { mismatch: true };
  }

  updateStrength(): void {
    const val = this.changeForm.get('newPassword')?.value || '';
    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val)) score += 15;
    if (/[a-z]/.test(val)) score += 15;
    if (/[0-9]/.test(val)) score += 10;
    if (/[^A-Za-z0-9]/.test(val)) score += 10;
    this.passwordStrength.set(Math.min(100, score));
  }

  toggleShowCurrent(): void {
    this.showCurrent.set(!this.showCurrent());
  }

  toggleShowNew(): void {
    this.showNew.set(!this.showNew());
  }

  toggleShowConfirm(): void {
    this.showConfirm.set(!this.showConfirm());
  }

  get f() {
    return this.changeForm.controls;
  }

  get pf() {
    return this.profileForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.changeForm.invalid) {
      return;
    }

    this.loading.set(true);
    const { confirmNewPassword, ...payload } = this.changeForm.value;
    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('✓ Password changed successfully');
        this.changeForm.reset();
        this.submitted.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Failed to change password',
        );
        setTimeout(() => this.errorMessage.set(null), 3000);
      },
    });
  }

  resetForm(): void {
    this.changeForm.reset();
    this.submitted.set(false);
    this.passwordStrength.set(0);
  }
}

