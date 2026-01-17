import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, SecurityContext } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnsiUp } from 'ansi_up';

@Component({
  selector: 'app-console',
  imports: [],
  templateUrl: './console.component.html',
  styleUrl: './console.component.css'
})
export class ConsoleComponent implements OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  private wsSubscription!: Subscription;
  private ansiUp = new AnsiUp();
  messages: SafeHtml[] = [];
  private shouldScrollToBottom = false;

  constructor(private sanitizer: DomSanitizer) {}

  public resetMessages(): void {
    this.messages = [];
  }

  public appendMessage(rawMsg: string): void {
    const htmlString = this.ansiUp.ansi_to_html(rawMsg);
    const safeMsg = this.sanitizer.bypassSecurityTrustHtml(htmlString);
    
    this.messages = [...this.messages, safeMsg]; 
    
    this.shouldScrollToBottom = true;
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { 
      console.log('Scroll container not found yet');
    }
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}