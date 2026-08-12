import { QuizzesController } from './quizzes.controller';

describe('QuizzesController', () => {
  let controller: QuizzesController;

  beforeEach(() => {
    controller = new QuizzesController({} as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
