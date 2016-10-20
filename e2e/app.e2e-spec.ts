import { NinosPage } from './app.po';

describe('ninos App', function() {
  let page: NinosPage;

  beforeEach(() => {
    page = new NinosPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
