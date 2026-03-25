CKEDITOR.addTemplates('default', {
    // The name of the subfolder that contains the preview images of the templates.
    imagesPath: ((typeof contextJsParameters != 'undefined') ? contextJsParameters.contextPath : '') + '/modules/bootstrap5-components/img/',
    // Template definitions.
    templates: [
        {
            title: 'Code blocks',
            image: 'code-blocks.png',
            description: 'Sample code blocks for displaying preformatted text',
            html: '<pre><code>&lt;p&gt;Sample text here...&lt;/p&gt;\n&lt;p&gt;And another line of sample text here...&lt;/p&gt;</code></pre>'
        },
        {
            title: 'Alert Primary',
            image: 'alert-primary.png',
            description: 'A primary-colored alert for important messages',
            html: '<div class="alert alert-primary" role="alert">\n' +
                '  This is a primary alert—check it out!\n' +
                '</div>'
        },
        {
            title: 'Alert Secondary',
            image: 'alert-secondary.png',
            description: 'A secondary-colored alert for less prominent messages',
            html: '<div class="alert alert-secondary" role="alert">\n' +
                '  This is a secondary alert—check it out!\n' +
                '</div>'
        },
        {
            title: 'Alert Success',
            image: 'alert_success.png',
            description: 'A success alert to indicate successful operations or actions',
            html: '<div class="alert alert-success" role="alert">\n' +
                '  This is a success alert—check it out!\n' +
                '</div>'
        },
        {
            title: 'Alert Danger',
            image: 'alert-danger.png',
            description: 'A danger alert for highlighting critical or error messages',
            html: '<div class="alert alert-danger" role="alert">\n' +
                '  This is a danger alert—check it out!\n' +
                '</div>\n'
        },
        {
            title: 'Alert Warning',
            image: 'alert-warning.png',
            description: 'A warning alert for indicating potential issues or warnings',
            html: '<div class="alert alert-warning" role="alert">\n' +
                '  This is a warning alert—check it out!\n' +
                '</div>\n'
        },
        {
            title: 'Alert Info',
            image: 'alert-info.png',
            description: 'An info alert for providing informational messages',
            html: '<div class="alert alert-info" role="alert">\n' +
                '  This is an info alert—check it out!\n' +
                '</div>\n'
        },
        {
            title: 'Alert Light',
            image: 'alert-light.png',
            description: 'A light alert for subtle notifications or messages',
            html: '<div class="alert" role="alert">\n' +
                '  This is a light alert—check it out!\n' +
                '</div>\n'
        },
        {
            title: 'Alert Dark',
            image: 'alert-dark.png',
            description: 'A dark alert for displaying notifications or messages with a dark background',
            html: '<div class="alert alert-dark" role="alert">\n' +
                '  This is a dark alert—check it out!\n' +
                '</div>\n'
        },
        {
            title: 'Table',
            image: 'table.png',
            description: 'A basic table structure with sample data for tabular representation',
            html: '<table class="table">\n' +
                '  <thead>\n' +
                '    <tr>\n' +
                '      <th scope="col">#</th>\n' +
                '      <th scope="col">First Name</th>\n' +
                '      <th scope="col">Last Name</th>\n' +
                '      <th scope="col">Username</th>\n' +
                '    </tr>\n' +
                '  </thead>\n' +
                '  <tbody>\n' +
                '    <tr>\n' +
                '      <th scope="row">1</th>\n' +
                '      <td>Mark</td>\n' +
                '      <td>Otto</td>\n' +
                '      <td>@mdo</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">2</th>\n' +
                '      <td>Jacob</td>\n' +
                '      <td>Thornton</td>\n' +
                '      <td>@fat</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">3</th>\n' +
                '      <td>Larry</td>\n' +
                '      <td>the Bird</td>\n' +
                '      <td>@twitter</td>\n' +
                '    </tr>\n' +
                '  </tbody>\n' +
                '</table>'
        },
        {
            title: 'Description List',
            image: 'description-list.png',
            description: 'A list for defining terms and their descriptions',
            html: '<dl class="row">\n' +
                '  <dt class="col-sm-3">Description lists</dt>\n' +
                '  <dd class="col-sm-9">A description list is perfect for defining terms.</dd>\n' +
                '  <dt class="col-sm-3">Euismod</dt>\n' +
                '  <dd class="col-sm-9">Vestibulum id ligula porta felis euismod semper eget lacinia odio sem.</dd>\n' +
                '  <dt class="col-sm-3">Malesuada porta</dt>\n' +
                '  <dd class="col-sm-9">Etiam porta sem malesuada magna mollis euismod.</dd>\n' +
                '</dl>'
        },
        {
            title: 'Blockquote',
            image: 'blockquote.png',
            description: 'A blockquote with a citation and a source title',
            html: '<blockquote class="blockquote">\n' +
                '  <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>\n' +
                '  <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>\n' +
                '</blockquote>'
        },
        {
            title: 'Blockquote Right',
            image: 'blockquote-right.png',
            description: 'A right-aligned blockquote with a citation and a source title',
            html: '<blockquote class="blockquote text-right">\n' +
                '  <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>\n' +
                '  <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>\n' +
                '</blockquote>'
        },
        {
            title: 'Jumbotron',
            image: 'jumbotron.png',
            description: 'A large container for showcasing hero content or information',
            html: '<div class="jumbotron">\n' +
                '  <h1 class="display-3">Hello, world!</h1>\n' +
                '  <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>\n' +
                '  <hr class="my-4">\n' +
                '  <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>\n' +
                '  <p class="lead">\n' +
                '    <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>\n' +
                '  </p>\n' +
                '</div>'
        },
        {
            title: 'Card',
            image: 'card.png',
            description: 'A card component with an image, title, and description',
            html: '<div class="card" style="width: 18rem;">\n' +
                '  <img src="/modules/bootstrap5-components/img/cap.svg" class="card-img-top" alt="...">\n' +
                '  <div class="card-body">\n' +
                '    <h5 class="card-title">Card title</h5>\n' +
                '    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p>\n' +
                '    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
                '  </div>\n' +
                '</div>'
        },

    ]
});
