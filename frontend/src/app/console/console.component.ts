import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-console',
  imports: [],
  templateUrl: './console.component.html',
  styleUrl: './console.component.css'
})
export class ConsoleComponent implements OnInit, OnDestroy {
  // Use ViewChild to access the container in the DOM
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  messages: string[] = [".", ".", ".", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Hello World", "Test", "Welt"];
  private wsSubscription!: Subscription;
  private shouldScrollToBottom = true;

  // constructor(private wsService: WebSocketService) {}

  ngOnInit() {
    //this.wsSubscription = this.wsService.connect('wss://echo.websocket.org').subscribe({
    //  next: (msg) => {
    //    this.messages.push(msg.text || JSON.stringify(msg));
    //    
    //    this.scrollToBottom();
    //  },
    //  error: (err) => console.error(err),
    //  complete: () => console.warn('Completed!')
    //});
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false; // Reset the flag
    }
  }

  scrollToBottom(): void {
    try {
      // 3. Set the scroll top to the total height of the container
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