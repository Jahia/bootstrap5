CKEDITOR.addTemplates('default',
    {
        // The name of the subfolder that contains the preview images of the templates.
        imagesPath:((typeof contextJsParameters != 'undefined') ? contextJsParameters.contextPath : '') + '/modules/bootstrap5-components/img/',
        // Template definitions.
        templates:[
            {
                title:'Code blocks',
                image:'code-blocks.png',
                description:'',
                html:'<pre><code>&lt;p&gt;Sample text here...&lt;/p&gt;\n&lt;p&gt;And another line of sample text here...&lt;/p&gt;</code></pre>'
            },
            {
                title:'alert-primary',
                image:'alert-primary.png',
                description:'',
                html:'<div class="alert alert-primary" role="alert">\n' +
                '  This is a primary alert—check it out!\n' +
                '</div>'
            },
            {
                title:'alert-secondary',
                image:'alert-secondary.png',
                description:'',
                html:'<div class="alert alert-secondary" role="alert">\n' +
                '  This is a secondary alert—check it out!\n' +
                '</div>'
            },
            {
                title:'alert-success',
                image:'alert_success.png',
                description:'',
                html:'<div class="alert alert-success" role="alert">\n' +
                '  This is a success alert—check it out!\n' +
                '</div>'
            },
            {
                title:'alert-danger',
                image:'alert-danger.png',
                description:'',
                html:'<div class="alert alert-danger" role="alert">\n' +
                '  This is a danger alert—check it out!\n' +
                '</div>\n'
            },
            {
                title:'alert-warning',
                image:'alert-warning.png',
                description:'',
                html:'<div class="alert alert-warning" role="alert">\n' +
                '  This is a warning alert—check it out!\n' +
                '</div>\n'
            },            {
                title:'alert-info',
                image:'alert-info.png',
                description:'',
                html:'<div class="alert alert-info" role="alert">\n' +
                '  This is a info alert—check it out!\n' +
                '</div>\n'
            },            {
                title:'alert-light',
                image:'alert-light.png',
                description:'',
                html:'<div class="alert  " role="alert">\n' +
                '  This is a light alert—check it out!\n' +
                '</div>\n'
            },            {
                title:'alert-dark',
                image:'alert-dark.png',
                description:'',
                html:'<div class="alert alert-dark" role="alert">\n' +
                '  This is a dark alert—check it out!\n' +
                '</div>\n'
            },
            {
                title:'table',
                image:'table.png',
                description:'',
                html:'<table class="table">\n' +
                '  <thead>\n' +
                '    <tr>\n' +
                '      <th scope="col">#</th>\n' +
                '      <th scope="col">First Name</th>\n' +
                '      <th scope="col"Last Name</th>\n' +
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
                title:'Description list',
                image:'description-list.png',
                description:'',
                html:'<dl class="row">\n' +
                '  <dt class="col-sm-3">Description lists</dt>\n' +
                '  <dd class="col-sm-9">A description list is perfect for defining terms.</dd>\n' +
                '  <dt class="col-sm-3">Euismod</dt>\n' +
                '  <dd class="col-sm-9">Vestibulum id ligula porta felis euismod semper eget lacinia odio sem.</dd>\n' +
                '  <dt class="col-sm-3">Malesuada porta</dt>\n' +
                '  <dd class="col-sm-9">Etiam porta sem malesuada magna mollis euismod.</dd>\n' +
                '</dl>'
            },
            {
                title:'blockquote',
                image:'blockquote.png',
                description:'',
                html:'<blockquote class="blockquote">\n' +
                '  <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>\n' +
                '  <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>\n' +
                '</blockquote>'
            },
            {
                title:'blockquote-right',
                image:'blockquote-right.png',
                description:'',
                html:'<blockquote class="blockquote text-right">\n' +
                '  <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>\n' +
                '  <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>\n' +
                '</blockquote>'

            },
            {
                title:'jumbotron',
                image:'jumbotron.png',
                description:'',
                html:'<div class="jumbotron">\n' +
                '  <h1 class="display-3">Hello, world!</h1>\n' +
                '  <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>\n' +
                '  <hr class="my-4">\n' +
                '  <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>\n' +
                '  <p class="lead">\n' +
                '    <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>\n' +
                '  </p>\n' +
                '</div>'

            }
        ]
    });
