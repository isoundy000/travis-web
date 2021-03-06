import Mixin from '@ember/object/mixin';
import { service } from 'ember-decorators/service';
import { computed } from 'ember-decorators/object';

export default Mixin.create({
  @service externalLinks: null,

  @computed('repo.slug', 'build.pullRequestNumber')
  urlGithubPullRequest(slug, pullRequestNumber) {
    return this.get('externalLinks').githubPullRequest(slug, pullRequestNumber);
  },
});
