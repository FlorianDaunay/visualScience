import { Component, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ThemeService } from "../../core/theme";
import { IconComponent, IconName } from "../../shared/components/icon/icon.component";
import { ThemePickerComponent } from "../../shared/components/theme-picker/theme-picker.component";

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

/** Every route lives inside this shell: a sidebar with the app's information architecture. */
@Component({
  selector: "app-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ThemePickerComponent, IconComponent],
  templateUrl: "./app-shell.component.html",
})
export class AppShellComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly pickerOpen = signal(false);
  protected readonly sidebarOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { path: "/discoveries", label: "Discoveries", icon: "sparkles" },
    { path: "/researchers", label: "Researchers", icon: "users" },
    { path: "/institutions", label: "Institutions", icon: "building" },
    { path: "/stats", label: "Stats & trends", icon: "chart" },
    { path: "/about", label: "About & sources", icon: "info" },
  ];
}
